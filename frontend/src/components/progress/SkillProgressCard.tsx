import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookA,
  Headphones,
  BookMarked,
  Mic,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SkillProgressData } from '../../types/progress';

interface SkillProgressCardProps {
  skills: SkillProgressData;
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skills }) => {
  const skillList = [
    {
      id: 'vocabulary',
      title: 'Vocabulary',
      titleVi: 'Từ Vựng',
      percentage: skills.vocabulary.percentage,
      statPrimary: `${skills.vocabulary.wordsLearned} / ${skills.vocabulary.totalAvailable} words`,
      statSecondary: `${skills.vocabulary.mastered} mastered · ${skills.vocabulary.learning} learning`,
      icon: BookOpen,
      color: 'indigo',
      path: '/vocabulary',
      ctaText: 'Practice Vocab',
    },
    {
      id: 'grammar',
      title: 'Grammar',
      titleVi: 'Ngữ Pháp',
      percentage: skills.grammar.percentage,
      statPrimary: `${skills.grammar.completedLessons} / ${skills.grammar.totalLessons} lessons`,
      statSecondary: 'Exercises & rules covered',
      icon: BookA,
      color: 'amber',
      path: '/grammar',
      ctaText: 'Study Grammar',
    },
    {
      id: 'listening',
      title: 'Listening',
      titleVi: 'Luyện Nghe',
      percentage: skills.listening.percentage,
      statPrimary: `${skills.listening.completedLessons} / ${skills.listening.totalLessons} audio sessions`,
      statSecondary: 'Comprehension quizzes',
      icon: Headphones,
      color: 'blue',
      path: '/listening',
      ctaText: 'Listen Now',
    },
    {
      id: 'reading',
      title: 'Reading',
      titleVi: 'Luyện Đọc',
      percentage: skills.reading.percentage,
      statPrimary: `${skills.reading.completedArticles} / ${skills.reading.totalArticles} articles`,
      statSecondary: 'Articles with quizzes',
      icon: BookMarked,
      color: 'emerald',
      path: '/reading',
      ctaText: 'Read Articles',
    },
    {
      id: 'speaking',
      title: 'Speaking & AI Chat',
      titleVi: 'Luyện Nói & AI',
      percentage: skills.speaking.percentage,
      statPrimary: `${skills.speaking.completedConversations} conversations`,
      statSecondary: 'Interactive dialogue practice',
      icon: Mic,
      color: 'purple',
      path: '/dashboard',
      ctaText: 'Practice Speech',
    },
  ];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold sm:text-lg">Skill Mastery Progress</h2>
            <p className="text-xs text-muted-foreground">
              Real completion rates computed across all 5 English core competencies
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillList.map((skill) => {
          const IconComponent = skill.icon;
          return (
            <div
              key={skill.id}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-background/50 p-4 transition-all hover:border-primary/30 hover:bg-background/80 hover:shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        skill.color === 'indigo'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : skill.color === 'amber'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : skill.color === 'blue'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : skill.color === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-tight">
                        {skill.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {skill.titleVi}
                      </span>
                    </div>
                  </div>

                  <span className="text-base font-black tracking-tight text-foreground">
                    {skill.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div
                    role="progressbar"
                    aria-valuenow={skill.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill.title} progress`}
                    className="h-2 w-full overflow-hidden rounded-full bg-muted/60"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        skill.color === 'indigo'
                          ? 'bg-indigo-500'
                          : skill.color === 'amber'
                          ? 'bg-amber-500'
                          : skill.color === 'blue'
                          ? 'bg-blue-500'
                          : skill.color === 'emerald'
                          ? 'bg-emerald-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {skill.statPrimary}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {skill.statSecondary}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Link
                  to={skill.path}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <span>{skill.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
