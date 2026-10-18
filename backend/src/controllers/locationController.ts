import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export async function getActiveLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { nameEn: 'asc' }],
    });

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    next(error);
  }
}
