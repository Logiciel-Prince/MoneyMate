/**
 * Goal interface
 */
export interface Goal {
  /**
   * Unique identifier for the goal
   */
  id: string;

  /**
   * Name or title of the goal
   */
  name: string;

  /**
   * Target amount to be saved
   */
  targetAmount: number;

  /**
   * Amount currently saved towards the goal
   */
  savedAmount: number;

  /**
   * Date when the goal was created
   */
  createdAt: Date;
}
