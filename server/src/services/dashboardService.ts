import { Attempt, UserStats } from '../types';
import { IUserDashboardRepository } from '../repositories/interfaces';

export class DashboardService {
  constructor(private dashboardRepo: IUserDashboardRepository) {}

  async getStats(username: string): Promise<UserStats> {
    return this.dashboardRepo.getStats(username);
  }

  async getAttemptHistory(username: string): Promise<Attempt[]> {
    return this.dashboardRepo.getAttemptHistory(username);
  }
}
