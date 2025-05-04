// given an array of player IDs and desired number of games,
// return an array of [teamA, teamB], where each team is [p1, p2].
export function generateSchedule(
    playerIds: number[],
    numGames: number
  ): [number, number][][] {
    // 1) all unique pairs
    const pairs: [number, number][] = [];
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        pairs.push([playerIds[i], playerIds[j]]);
      }
    }
  
    // 2) all valid games = two disjoint pairs
    const games: [number, number][][] = [];
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        const [a, b] = pairs[i];
        const [c, d] = pairs[j];
        if (a !== c && a !== d && b !== c && b !== d) {
          games.push([pairs[i], pairs[j]]);
        }
      }
    }
  
    // 3) track how often each pair has appeared
    const pairKey = (p: [number, number]) =>
      p[0] < p[1] ? `${p[0]}-${p[1]}` : `${p[1]}-${p[0]}`;
    const count: Record<string, number> = {};
    pairs.forEach((p) => (count[pairKey(p)] = 0));
  
    // 4) pick games greedily to minimize max pair count
    const schedule: [number, number][][] = [];
    for (let k = 0; k < numGames; k++) {
      let bestIdx = 0;
      let bestScore = Infinity;
  
      for (let idx = 0; idx < games.length; idx++) {
        const [p1, p2] = games[idx];
        const score =
          count[pairKey(p1)] +
          count[pairKey(p2)];
        if (score < bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      }
  
      const picked = games.splice(bestIdx, 1)[0];
      schedule.push(picked);
      // increment counts
      const [u, v] = picked[0];
      const [x, y] = picked[1];
      count[pairKey([u, v])]++;  
      count[pairKey([x, y])]++;
    }
  
    return schedule;
  }
  