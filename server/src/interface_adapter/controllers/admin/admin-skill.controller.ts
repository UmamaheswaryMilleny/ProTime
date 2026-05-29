import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { ResponseHelper } from '../../helpers/response.helper';
import { HTTP_STATUS } from '../../../shared/constants/constants';
import { SkillModel } from '../../../infrastructure/database/models/skill.model';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Default skill definitions (mirrors buddy.enums.ts) ─────────────────────
const DEFAULT_SKILLS: { name: string; category: string; description: string }[] = [
  // TECHNOLOGY
  { name: 'Web Development',     category: 'TECHNOLOGY',        description: 'HTML, CSS, JavaScript, frameworks like React and Vue' },
  { name: 'App Development',     category: 'TECHNOLOGY',        description: 'iOS, Android, and cross-platform mobile development' },
  { name: 'UI/UX Design',        category: 'TECHNOLOGY',        description: 'User interface design and user experience principles' },
  { name: 'Data Science',        category: 'TECHNOLOGY',        description: 'Data analysis, visualization, and statistical modeling' },
  { name: 'DevOps',              category: 'TECHNOLOGY',        description: 'CI/CD pipelines, containerization, cloud infrastructure' },
  { name: 'AI & ML',             category: 'TECHNOLOGY',        description: 'Artificial intelligence and machine learning fundamentals' },
  { name: 'Cyber Security',      category: 'TECHNOLOGY',        description: 'Network security, ethical hacking, and security protocols' },
  // ACADEMICS
  { name: 'Mathematics',         category: 'ACADEMICS',         description: 'Algebra, calculus, statistics, and discrete math' },
  { name: 'Physics',             category: 'ACADEMICS',         description: 'Classical mechanics, electromagnetism, and modern physics' },
  { name: 'Chemistry',           category: 'ACADEMICS',         description: 'Organic, inorganic, and physical chemistry' },
  { name: 'Biology',             category: 'ACADEMICS',         description: 'Cell biology, genetics, ecology, and physiology' },
  { name: 'History',             category: 'ACADEMICS',         description: 'World history, civilizations, and historical analysis' },
  // LANGUAGES
  { name: 'French',              category: 'LANGUAGES',         description: 'French language learning from beginner to advanced' },
  { name: 'Spanish',             category: 'LANGUAGES',         description: 'Spanish language learning from beginner to advanced' },
  { name: 'Japanese',            category: 'LANGUAGES',         description: 'Japanese language including Hiragana, Katakana, and Kanji' },
  { name: 'German',              category: 'LANGUAGES',         description: 'German language learning from beginner to advanced' },
  { name: 'Arabic',              category: 'LANGUAGES',         description: 'Arabic language learning from beginner to advanced' },
  // TEST_PREPARATION
  { name: 'GATE',                category: 'TEST_PREPARATION',  description: 'Graduate Aptitude Test in Engineering preparation' },
  { name: 'GRE',                 category: 'TEST_PREPARATION',  description: 'Graduate Record Examinations preparation' },
  { name: 'IELTS',               category: 'TEST_PREPARATION',  description: 'International English Language Testing System prep' },
  { name: 'UPSC',                category: 'TEST_PREPARATION',  description: 'Union Public Service Commission exam preparation' },
  { name: 'CAT',                 category: 'TEST_PREPARATION',  description: 'Common Admission Test (MBA entrance) preparation' },
  // MACHINE_LEARNING
  { name: 'Deep Learning',       category: 'MACHINE_LEARNING',  description: 'Neural networks, CNNs, RNNs, and transformer models' },
  { name: 'NLP',                 category: 'MACHINE_LEARNING',  description: 'Natural language processing and text analysis' },
  { name: 'Computer Vision',     category: 'MACHINE_LEARNING',  description: 'Image recognition, object detection, and segmentation' },
  { name: 'Reinforcement Learning', category: 'MACHINE_LEARNING', description: 'Reward-based learning, Q-learning, and policy gradients' },
  { name: 'MLOps',               category: 'MACHINE_LEARNING',  description: 'ML pipelines, model deployment, and monitoring' },
  // OTHER
  { name: 'Others',              category: 'OTHER',             description: 'Any other study subject or skill not listed above' },
];

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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      next(error);
    }
  }

  // ─── POST /admin/skills/seed-defaults ──────────────────────────────────────
  async seedDefaultSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let inserted = 0;
      let skipped = 0;

      for (const skill of DEFAULT_SKILLS) {
        const existing = await SkillModel.findOne({
          name: { $regex: new RegExp(`^${escapeRegExp(skill.name)}$`, 'i') }
        }).lean();

        if (existing) {
          skipped++;
        } else {
          await SkillModel.create({
            name: skill.name,
            category: skill.category,
            description: skill.description,
            isActive: true,
          });
          inserted++;
        }
      }

      ResponseHelper.success(res, HTTP_STATUS.CREATED, `Seeded ${inserted} skills (${skipped} already existed)`, {
        inserted,
        skipped,
        total: DEFAULT_SKILLS.length,
      });
    } catch (error: unknown) {
      next(error);
    }
  }
}

