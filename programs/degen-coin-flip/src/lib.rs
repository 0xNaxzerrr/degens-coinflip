use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction,
    program::{invoke, invoke_signed},
    native_token::LAMPORTS_PER_SOL,
};
declare_id!("74bEiQKaJsew21GeYvNBtSpAketMDiZjpQHADtFdW5iK");

#[program]
pub mod coinflip {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        game_state.admin = ctx.accounts.admin.key();
        game_state.bump = ctx.bumps.game_state;
        
        msg!("Game initialized with admin: {}", game_state.admin);
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64, user_choice: u8) -> Result<()> {
        // Validate bet amount (between 0.1 and 5 SOL)
        let min_bet = LAMPORTS_PER_SOL / 10;  // 0.1 SOL
        let max_bet = 5 * LAMPORTS_PER_SOL;   // 5 SOL
        
        require!(amount >= min_bet && amount <= max_bet, GameError::InvalidBetAmount);
        require!(user_choice == 0 || user_choice == 1, GameError::InvalidChoice);
        
        // Transfer the bet amount from player to the escrow
        let ix = system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.escrow.key(),
            amount,
        );
        
        invoke(
            &ix,
            &[
                ctx.accounts.player.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        // Create the bet account to store the player's bet info
        let bet = &mut ctx.accounts.bet;
        bet.player = ctx.accounts.player.key();
        bet.amount = amount;
        bet.user_choice = user_choice;
        bet.timestamp = Clock::get()?.unix_timestamp;
        bet.bump = ctx.bumps.bet;
        
        // En une seule transaction, nous plaçons le pari et déterminons immédiatement le résultat
        // Utilisation des données de la blockchain pour générer un nombre pseudo-aléatoire
        let clock = Clock::get()?;
        let slot = clock.slot;
        let timestamp = clock.unix_timestamp;
        
        // Combinaison de diverses sources pour générer de l'aléatoire
        let seed = format!("{}{}{}{}", timestamp, slot, bet.player, amount);
        let hash = anchor_lang::solana_program::hash::hash(seed.as_bytes());
        let random_value = hash.to_bytes()[0];
        
        // Détermine le résultat (0 = Pile, 1 = Face)
        bet.result = random_value % 2;
        
        // Détermine si le joueur a gagné
        let won = bet.user_choice == bet.result;
        bet.status = if won { BetStatus::Won } else { BetStatus::Lost };
        
        let result_text = if bet.result == 0 { "Heads" } else { "Tails" };
        
        // Si le joueur a gagné, transfert des gains
        if won {
            // Calcul des gains (2x la mise)
            let winnings = amount * 2;
            
            // Transfert des gains de l'escrow au joueur
            let escrow_seeds = &[
                b"escrow".as_ref(),
                &[ctx.accounts.game_state.bump],
            ];
            let signer = &[&escrow_seeds[..]];
            
            let ix = system_instruction::transfer(
                &ctx.accounts.escrow.key(),
                &ctx.accounts.player.key(),
                winnings,
            );
            
            invoke_signed(
                &ix,
                &[
                    ctx.accounts.escrow.to_account_info(),
                    ctx.accounts.player.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                signer,
            )?;
            
            msg!("Player won! The result was {}. Transferred {} SOL to player", result_text, winnings as f64 / LAMPORTS_PER_SOL as f64);
        } else {
            msg!("Player lost! The result was {}. Better luck next time.", result_text);
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 1,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        seeds = [b"escrow"],
        bump,
    )]
    /// CHECK: This is just a PDA to hold funds
    pub escrow: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 8 + 1 + 1 + 8 + 1 + 1,
        seeds = [b"bet", player.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    
    #[account(
        mut,
        seeds = [b"escrow"],
        bump,
    )]
    /// CHECK: This is just a PDA to hold funds
    pub escrow: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"game_state"],
        bump,
    )]
    pub game_state: Account<'info, GameState>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameState {
    pub admin: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Bet {
    pub player: Pubkey,
    pub amount: u64,
    pub user_choice: u8,  // 0 for Heads, 1 for Tails
    pub status: BetStatus,
    pub timestamp: i64,
    pub result: u8,       // 0 for Heads, 1 for Tails
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetStatus {
    Pending,
    Won,
    Lost,
}

#[error_code]
pub enum GameError {
    #[msg("Invalid bet amount. Bet must be between 0.1 and 5 SOL")]
    InvalidBetAmount,
    #[msg("Invalid choice. Must be 0 (Heads) or 1 (Tails)")]
    InvalidChoice,
}