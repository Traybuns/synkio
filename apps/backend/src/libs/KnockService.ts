import { logger } from '../utils/logger';

export class KnockService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.knock.app/v1';

  constructor() {
    const apiKey = process.env.KNOCK_API_KEY;
    if (!apiKey) {
      logger.warn('KNOCK_API_KEY not found. Email notifications will be disabled.');
      return;
    }

    this.apiKey = apiKey;
    logger.info('Knock service initialized successfully');
  }

  private async triggerWorkflow(
    workflowKey: string,
    recipients: string[],
    data: Record<string, any>
  ): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('Knock service not initialized. Skipping email notification.');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/workflows/${workflowKey}/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients,
          data
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`Knock API error: ${response.status} ${response.statusText}`, {
          workflowKey,
          error: errorData
        });
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error(`Failed to trigger Knock workflow: ${error.message}`, {
        workflowKey,
        error: error.message
      });
      return false;
    }
  }

  async notifyWaitlistSignup(email: string, name: string): Promise<boolean> {
    const workflowKey = process.env.KNOCK_WORKFLOW_WAITLIST || 'waitlist-signup';
    
    const success = await this.triggerWorkflow(workflowKey, [email], {
      name,
      email,
      signupDate: new Date().toISOString()
    });

    if (success) {
      logger.info(`Waitlist signup notification sent to ${email}`);
    } else {
      logger.error(`Failed to send waitlist signup notification to ${email}`);
    }

    return success;
  }

  async notifyLaunch(email: string, name: string): Promise<boolean> {
    const workflowKey = process.env.KNOCK_WORKFLOW_LAUNCH || 'launch-notification';
    
    const success = await this.triggerWorkflow(workflowKey, [email], {
      name,
      email,
      launchDate: new Date().toISOString()
    });

    if (success) {
      logger.info(`Launch notification sent to ${email}`);
    } else {
      logger.error(`Failed to send launch notification to ${email}`);
    }

    return success;
  }
}

export const knockService = new KnockService();
