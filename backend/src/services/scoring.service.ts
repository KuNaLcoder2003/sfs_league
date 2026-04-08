import { BallType } from '@prisma/client';

export interface BallCalculation {
    physicalRuns: number;   // actual bat runs (unmodified)
    scoredRuns: number;     // after powerplay doubling
    extras: number;         // wide/no-ball penalty (+1 per delivery)
    wicketPenalty: number;  // -2 if wicket in powerplay
    netRuns: number;        // scoredRuns + extras - wicketPenalty
    isFairBall: boolean;
    isPowerplay: boolean;
    rotateStrike: boolean;
}

export function calculateBall(
    ballType: BallType,
    physicalRuns: number,
    isWicket: boolean,
    overNumber: number,
    powerplayOvers: number
): BallCalculation {
    const isPowerplay = overNumber <= powerplayOvers;
    const isFairBall = ballType === 'FAIR_BALL';

    let scoredRuns = 0;
    let extras = 0;
    let wicketPenalty = 0;

    switch (ballType) {
        case 'WIDE':
            // +1 mandatory + any extra runs (overthrows etc, but usually 0 for wides)
            extras = 1 + physicalRuns;
            break;
        case 'NO_BALL':
            // +1 mandatory no-ball penalty; batting runs off no-ball are NOT doubled
            extras = 1;
            scoredRuns = physicalRuns; // batter can still score off a no-ball
            break;
        case 'DEAD_BALL':
            // Nothing counts
            break;
        case 'FAIR_BALL':
            scoredRuns = isPowerplay ? physicalRuns * 2 : physicalRuns;
            if (isWicket && isPowerplay) {
                wicketPenalty = 2; // SCL rule: 2 run penalty per wicket in powerplay
            }
            break;
    }

    const netRuns = scoredRuns + extras - wicketPenalty;

    // Strike rotation: odd runs on FAIR_BALL → swap ends
    // (Rotation at end-of-over is handled separately in the controller)
    const rotateStrike = isFairBall && physicalRuns % 2 !== 0;

    return {
        physicalRuns,
        scoredRuns,
        extras,
        wicketPenalty,
        netRuns,
        isFairBall,
        isPowerplay,
        rotateStrike,
    };
}

export function formatOversDisplay(totalFairBalls: number): string {
    const overs = Math.floor(totalFairBalls / 6);
    const balls = totalFairBalls % 6;
    return `${overs}.${balls}`;
}

export function parseCricketOvers(totalFairBalls: number): number {
    // Store as cricket-notation float: 13 balls → 2.1
    const overs = Math.floor(totalFairBalls / 6);
    const balls = totalFairBalls % 6;
    return parseFloat(`${overs}.${balls}`);
}