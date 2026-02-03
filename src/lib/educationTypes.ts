/**
 * Education Module Type Definitions
 * Defines slide variants, modules, and progress tracking types
 */

// ============================================================================
// Slide Types (Discriminated Union)
// ============================================================================

/** Base fields shared by all slide types */
interface SlideBase {
  /** Unique identifier for the slide (e.g., "slide-1-1") */
  id: string;
  /** Display title for the slide */
  title: string;
}

/** Introduction slide - welcomes user to a module */
export interface IntroSlide extends SlideBase {
  type: 'intro';
  /** Main content body text */
  body: string;
  /** Optional mascot image path */
  mascotImage?: string;
}

/** Concept slide - explains a concept with optional diagram */
export interface ConceptSlide extends SlideBase {
  type: 'concept';
  /** Main content body text */
  body: string;
  /** Optional diagram/illustration path */
  diagram?: string;
}

/** Quiz option for multiple choice questions */
export interface QuizOption {
  /** Unique option identifier (e.g., "a", "b", "c") */
  id: string;
  /** Option display text */
  text: string;
}

/** Quiz slide - tests user understanding with multiple choice */
export interface QuizSlide extends SlideBase {
  type: 'quiz';
  /** Question text */
  question: string;
  /** Available answer options */
  options: QuizOption[];
  /** ID of the correct option */
  correctOptionId: string;
  /** Explanation shown after answering */
  explanation: string;
}

/** Action types that can be triggered from action slides */
export type ActionType = 'wallet_connect' | 'channel_join';

/** Action slide - prompts user to take an action */
export interface ActionSlide extends SlideBase {
  type: 'action';
  /** Instruction text explaining what to do */
  instruction: string;
  /** Type of action required */
  actionType: ActionType;
  /** Button text for the action */
  buttonText: string;
}

/** Reward slide - celebrates completion and awards points/badge */
export interface RewardSlide extends SlideBase {
  type: 'reward';
  /** Celebration message */
  body: string;
  /** Points awarded for completing the module */
  pointsAwarded: number;
  /** Badge identifier earned */
  badgeId: string;
  /** Display name for the badge */
  badgeName: string;
}

/** Union of all slide types */
export type Slide = IntroSlide | ConceptSlide | QuizSlide | ActionSlide | RewardSlide;

// ============================================================================
// Module Type
// ============================================================================

/** Education module containing slides and metadata */
export interface Module {
  /** Unique module identifier (e.g., "module-1") */
  id: string;
  /** Display title */
  title: string;
  /** Brief description of module content */
  description: string;
  /** Emoji icon for the module */
  icon: string;
  /** Total points awarded for completing this module */
  totalPoints: number;
  /** Badge identifier earned upon completion */
  badgeId: string;
  /** Display name for the badge */
  badgeName: string;
  /** Whether this module is locked (requires prerequisite) */
  isLocked: boolean;
  /** Module ID that must be completed before this one (null if no prerequisite) */
  prerequisiteModuleId: string | null;
  /** Ordered array of slides in this module */
  slides: Slide[];
}

// ============================================================================
// Wrapper Types
// ============================================================================

/** Root structure for education_modules.json */
export interface EducationModulesData {
  /** Schema version for future migrations */
  version: string;
  /** Array of all education modules */
  modules: Module[];
}

/** Database row type for user_education_progress table */
export interface UserEducationProgress {
  /** UUID primary key */
  id: string;
  /** Telegram user ID (BIGINT stored as number) */
  user_id: number;
  /** Module identifier being tracked */
  module_id: string;
  /** Current slide index (0-based) */
  slide_index: number;
  /** Timestamp when module was completed (null if in progress) */
  completed_at: string | null;
  /** Whether badge was earned for this module */
  badge_earned: boolean;
  /** Record creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}
