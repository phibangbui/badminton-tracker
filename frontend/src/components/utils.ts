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
        // Sort teams for easier comparison
        const team1 = [pairs[i][0], pairs[i][1]].sort((x, y) => x - y);
        const team2 = [pairs[j][0], pairs[j][1]].sort((x, y) => x - y);
        // Sort teams within the game for canonical form
        const game = [team1, team2].sort((a, b) => a[0] - b[0]);
        games.push(game as [number, number][]);
      }
    }
  }

  // Track how many games each player has played, when they last played, and breaks
  const playCount: Record<number, number> = {};
  const lastPlayed: Record<number, number> = {};
  const breaks: Record<number, number> = {};
  // Track how many times each pair has played together
  const pairCount: Record<string, number> = {};
  playerIds.forEach((id) => {
    playCount[id] = 0;
    lastPlayed[id] = -1;
    breaks[id] = 0;
  });
  pairs.forEach(([a, b]) => {
    pairCount[[a, b].sort((x, y) => x - y).join('-')] = 0;
  });

  const schedule: [number, number][][] = [];
  let prevPlayers: Set<number> = new Set();
  for (let k = 0; k < numGames; k++) {
    // Sort players by (breaks desc, lastPlayed asc)
    const sorted = [...playerIds].sort((a, b) => {
      if (breaks[b] !== breaks[a]) return breaks[b] - breaks[a];
      return lastPlayed[a] - lastPlayed[b];
    });
    // Pick the 4 with most breaks/longest rest
    const candidates = sorted.slice(0, 6); // Try all 4-player combos from top 6
    let bestGame: [number, number][] | null = null;
    let bestScore = -Infinity;
    // Try all 4-player combinations from the top 6
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        for (let m = 0; m < candidates.length; m++) {
          if (m === i || m === j) continue;
          for (let n = m + 1; n < candidates.length; n++) {
            if (n === i || n === j) continue;
            const group = [candidates[i], candidates[j], candidates[m], candidates[n]];
            // Only unique sets
            if (new Set(group).size !== 4) continue;
            const teamA: [number, number] = [candidates[i], candidates[j]];
            const teamB: [number, number] = [candidates[m], candidates[n]];
            // Check if this is a valid game
            if (games.some(([a, b]) =>
              (a[0] === teamA[0] && a[1] === teamA[1] && b[0] === teamB[0] && b[1] === teamB[1]) ||
              (a[0] === teamB[0] && a[1] === teamB[1] && b[0] === teamA[0] && b[1] === teamA[1])
            )) {
              // Calculate pair penalty
              const pairAKey = [teamA[0], teamA[1]].sort((x, y) => x - y).join('-');
              const pairBKey = [teamB[0], teamB[1]].sort((x, y) => x - y).join('-');
              const pairPenalty = pairCount[pairAKey] + pairCount[pairBKey];
              // Penalty for players who played last game
              const prevPenalty = group.filter((id) => prevPlayers.has(id)).length * 1000;
              // Score: prioritize fewer repeated pairs, then rest, then new players
              const lastA = Math.min(k - lastPlayed[teamA[0]], k - lastPlayed[teamA[1]]);
              const lastB = Math.min(k - lastPlayed[teamB[0]], k - lastPlayed[teamB[1]]);
              const score = -pairPenalty * 100 + lastA + lastB - prevPenalty;
              if (score > bestScore) {
                bestScore = score;
                bestGame = [teamA, teamB];
              }
            }
          }
        }
      }
    }
    let foundGame = bestGame;
    if (!foundGame) {
      // fallback: pick any valid game with the 4 most rested
      foundGame = games.find(([a, b]) => {
        const ids = [...a, ...b];
        return sorted.slice(0, 4).every((id) => ids.includes(id));
      }) || games[0];
    }
    schedule.push(foundGame);
    // Update play counts, last played, breaks, and pairCount
    const playing = [...foundGame[0], ...foundGame[1]];
    prevPlayers = new Set(playing);
    const pairAKey = [foundGame[0][0], foundGame[0][1]].sort((x, y) => x - y).join('-');
    const pairBKey = [foundGame[1][0], foundGame[1][1]].sort((x, y) => x - y).join('-');
    pairCount[pairAKey]++;
    pairCount[pairBKey]++;
    playerIds.forEach((id) => {
      if (playing.includes(id)) {
        playCount[id]++;
        lastPlayed[id] = k;
      } else {
        breaks[id]++;
      }
    });
  }
  return schedule;
}
