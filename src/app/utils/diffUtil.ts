export const detectLogDifferences = (newLog: any, historicalLogs: any[]) => {
    const diffs: { oldLog: string; newLog: string }[] = [];
    historicalLogs.forEach((log) => {
      if (log.message !== newLog.message) {
        diffs.push({ oldLog: log.message, newLog: newLog.message });
      }
    });
    return diffs;
  };
