import { Request, Response } from 'express';
import { z } from 'zod';
import { Waitlist } from '../models/Waitlist';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware';
import { ApiResponse } from '../interfaces';
import { sanitizeEmail, sanitizeString } from '../utils/sanitize';
import { knockService } from '../libs/KnockService';

const waitlistSignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long')
  })
});

export class WaitlistController {
  static signup = asyncHandler(async (req: Request, res: Response) => {
    try {
      const validated = waitlistSignupSchema.parse({ body: req.body });
      const { email, name } = validated.body;

      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedName = sanitizeString(name.trim());

      if (!sanitizedEmail) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      const existingEntry = await Waitlist.findOne({ email: sanitizedEmail });
      if (existingEntry) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered on the waitlist',
          message: 'You are already on the waitlist!',
          data: {
            email: existingEntry.email,
            name: existingEntry.name,
            createdAt: existingEntry.createdAt
          }
        });
      }

      const waitlistEntry = new Waitlist({
        email: sanitizedEmail,
        name: sanitizedName,
        notified: false
      });

      await waitlistEntry.save();

      try {
        await knockService.notifyWaitlistSignup(sanitizedEmail, sanitizedName);
        waitlistEntry.notified = true;
        waitlistEntry.notifiedAt = new Date();
        await waitlistEntry.save();
      } catch (error) {
        logger.warn(`Failed to send notification email to ${sanitizedEmail}, but waitlist entry was saved:`, error);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Successfully added to waitlist!',
        data: {
          email: waitlistEntry.email,
          name: waitlistEntry.name,
          createdAt: waitlistEntry.createdAt
        }
      };

      logger.info(`New waitlist signup: ${sanitizedEmail} (${sanitizedName})`);

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }

      if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('E11000'))) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered on the waitlist'
        });
      }

      logger.error('Error creating waitlist entry:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add to waitlist. Please try again later.'
      });
    }
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [entries, total] = await Promise.all([
        Waitlist.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Waitlist.countDocuments()
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          entries,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching waitlist entries:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch waitlist entries'
      });
    }
  });
}
