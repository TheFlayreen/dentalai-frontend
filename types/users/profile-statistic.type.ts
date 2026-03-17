export interface IProfileStatistic {
  sessionsCounts: {
    completed: number;
    total: number;
  };
  avgPerformanceScore: number;
  categories: {
    category: string;
    avg: number;
  }[];
}