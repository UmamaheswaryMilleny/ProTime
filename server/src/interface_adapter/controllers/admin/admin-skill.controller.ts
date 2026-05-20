import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';
import { SkillModel } from '../../../infrastructure/database/models/skill.model';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@injectable()
export class AdminSkillController {
  
  // ─── GET /admin/skills ─────────────────────────────────────────────────────
  async getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string | undefined)?.trim();
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined; // 'ALL', 'ACTIVE', 'INACTIVE'
      
      const page = Math.max(1, Number(req.query.page ?? 1));
      const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 10)));
      
      const query: Record<string, any> = {};
      
      if (search) {
        query.name = { $regex: new RegExp(escapeRegExp(search), 'i') };
      }
      
      if (category && category !== 'ALL') {
        query.category = category;
      }
      
      if (status === 'ACTIVE') {
        query.isActive = true;
      } else if (status === 'INACTIVE') {
        query.isActive = false;
      }
      
      const [skills, total] = await Promise.all([
        SkillModel.find(query)
          .sort({ name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        SkillModel.countDocuments(query),
      ]);
      
      // Calculate Stats
      const [totalCount, activeCount, categories] = await Promise.all([
        SkillModel.countDocuments({}),
        SkillModel.countDocuments({ isActive: true }),
        SkillModel.distinct('category'),
      ]);
      
      const stats = {
        total: totalCount,
        active: activeCount,
        inactive: totalCount - activeCount,
        categoriesCount: categories.length,
      };
      
      const totalPages = Math.ceil(total / limit) || 1;
      
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Skills retrieved successfully', {
        skills,
        total,
        page,
        totalPages,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── POST /admin/skills ────────────────────────────────────────────────────
  async createSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, category, description } = req.body;
      
      if (!name || !name.trim()) {
        ResponseHelper.error(res, 'Skill name is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      if (!category || !category.trim()) {
        ResponseHelper.error(res, 'Skill category is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      const trimmedName = name.trim();
      const trimmedCategory = category.trim();
      
      // Check for duplicate name case-insensitive
      const existing = await SkillModel.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(trimmedName)}$`, 'i') }
      }).lean();
      
      if (existing) {
        ResponseHelper.error(res, 'A skill with this name already exists', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      const skill = await SkillModel.create({
        name: trimmedName,
        category: trimmedCategory,
        description: description?.trim() || '',
        isActive: true
      });
      
      ResponseHelper.success(res, HTTP_STATUS.CREATED, 'Skill created successfully', skill);
    } catch (error) {
      next(error);
    }
  }

  // ─── PUT /admin/skills/:skillId ────────────────────────────────────────────
  async updateSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skillId } = req.params;
      const { name, category, description } = req.body;
      
      if (!name || !name.trim()) {
        ResponseHelper.error(res, 'Skill name is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      if (!category || !category.trim()) {
        ResponseHelper.error(res, 'Skill category is required', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      const trimmedName = name.trim();
      const trimmedCategory = category.trim();
      
      // Check duplicate name excluding current skillId
      const existing = await SkillModel.findOne({
        _id: { $ne: skillId as any },
        name: { $regex: new RegExp(`^${escapeRegExp(trimmedName)}$`, 'i') }
      }).lean();
      
      if (existing) {
        ResponseHelper.error(res, 'Another skill with this name already exists', HTTP_STATUS.BAD_REQUEST);
        return;
      }
      
      const updated = await SkillModel.findByIdAndUpdate(
        skillId,
        {
          $set: {
            name: trimmedName,
            category: trimmedCategory,
            description: description?.trim() || '',
          }
        },
        { new: true }
      ).lean();
      
      if (!updated) {
        ResponseHelper.error(res, 'Skill not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Skill updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  // ─── PATCH /admin/skills/:skillId/toggle ───────────────────────────────────
  async toggleSkillStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skillId } = req.params;
      
      const skill = await SkillModel.findById(skillId);
      if (!skill) {
        ResponseHelper.error(res, 'Skill not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      
      skill.isActive = !skill.isActive;
      await skill.save();
      
      ResponseHelper.success(res, HTTP_STATUS.OK, `Skill status toggled to ${skill.isActive ? 'Active' : 'Inactive'}`, skill);
    } catch (error) {
      next(error);
    }
  }

  // ─── DELETE /admin/skills/:skillId ─────────────────────────────────────────
  async deleteSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skillId } = req.params;
      
      const deleted = await SkillModel.findByIdAndDelete(skillId).lean();
      if (!deleted) {
        ResponseHelper.error(res, 'Skill not found', HTTP_STATUS.NOT_FOUND);
        return;
      }
      
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Skill deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
