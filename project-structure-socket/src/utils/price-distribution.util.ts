export interface PrizePayout {
    rank: number;
    percent: string;
    amount: string;
}

export interface PrizeDistribution {
    players: number;
    entryFee: number;
    winners: number;
    prizePot: string;
    totalDistributed: string;
    remaining: string;
    payouts: PrizePayout[];
}

export function calculatePrizeDistribution(
    players: number,
    entryFee: number
): PrizeDistribution {
    if (players <= 0 || entryFee <= 0) {
        return {
            players,
            entryFee,
            winners: 0,
            prizePot: '0.00',
            payouts: [],
            totalDistributed: '0.00',
            remaining: '0.00',
        };
    }

    const PRIZE_PCT = 0.7;
    const WINNER_PCT = 0.1;

    const prizePot = players * entryFee * PRIZE_PCT;
    const prizePotCents = Math.round(prizePot * 100);
    const winners = Math.max(1, Math.ceil(players * WINNER_PCT));

    const pattern50 = (() => {
        const arr: number[] = [];
        arr.push(0.235, 0.118, 0.082);
        for (let i = 4; i <= 10; i++) arr.push(0.0294);
        for (let i = 11; i <= 25; i++) arr.push(0.0141);
        for (let i = 26; i <= 50; i++) arr.push(0.0059);
        return arr;
    })();

    const pattern100 = (() => {
        const arr: number[] = [];
        arr.push(0.15, 0.1, 0.07);
        for (let i = 4; i <= 10; i++) arr.push(0.03);
        for (let i = 11; i <= 25; i++) arr.push(0.015);
        for (let i = 26; i <= 50; i++) arr.push(0.006);
        for (let i = 51; i <= 100; i++) arr.push(0.002);
        return arr;
    })();

    let raw: number[] = [];

    if (winners <= 50) {
        raw = pattern50.slice(0, winners);
    } else if (winners <= 100) {
        raw = pattern100.slice(0, winners);
    } else {
        const alpha = 1.08;
        for (let r = 1; r <= winners; r++) {
            raw.push(1 / Math.pow(r, alpha));
        }
    }

    const rawSum = raw.reduce((sum, val) => sum + val, 0);
    const normalized = raw.map((v) => v / rawSum);
    const payoutsCents: number[] = normalized.map((p) =>
        Math.round(p * prizePotCents)
    );

    if (payoutsCents.length === 0) {
        return {
            players,
            entryFee,
            winners,
            prizePot: prizePot.toFixed(2),
            totalDistributed: '0.00',
            remaining: prizePot.toFixed(2),
            payouts: [],
        };
    }

    const distributedCents = payoutsCents.reduce((sum, val) => sum + val, 0);
    const remainder = prizePotCents - distributedCents;

    if (remainder !== 0) {
        if (remainder > 0) {
            payoutsCents[0]! += remainder;
        } else {
            let rem = -remainder;
            for (let i = payoutsCents.length - 1; i >= 0 && rem > 0; i--) {
                const take = Math.min(rem, payoutsCents[i]!);
                payoutsCents[i]! -= take;
                rem -= take;
            }
            if (rem > 0) payoutsCents[0]! -= rem;
        }
    }

    const payouts: PrizePayout[] = payoutsCents.map((cents, idx) => ({
        rank: idx + 1,
        percent: (normalized[idx]! * 100).toFixed(2),
        amount: (cents / 100).toFixed(2),
    }));

    const totalDistributed =
        payoutsCents.reduce((sum, val) => sum + val, 0) / 100;

    return {
        players,
        entryFee,
        winners,
        prizePot: prizePot.toFixed(2),
        totalDistributed: totalDistributed.toFixed(2),
        remaining: (prizePot - totalDistributed).toFixed(2),
        payouts,
    };
}
