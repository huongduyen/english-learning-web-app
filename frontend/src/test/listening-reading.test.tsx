import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AudioPlayer } from '../components/listening/AudioPlayer';
import { TranscriptViewer } from '../components/listening/TranscriptViewer';
import { ReadingArticleCard } from '../components/reading/ReadingArticleCard';
import { ReadingArticleListItem } from '../types/reading';

describe('Listening & Reading Component Tests', () => {
  describe('AudioPlayer', () => {
    it('renders HTML audio player when audioUrl is present', () => {
      render(
        <AudioPlayer
          audioUrl="https://example.com/audio.mp3"
          title="Daily Conversation Lesson"
        />,
      );

      expect(screen.getByText('Lesson Audio Track')).toBeInTheDocument();
      expect(screen.getByText('Daily Conversation Lesson')).toBeInTheDocument();
      const audio = screen.getByLabelText(/audio for daily conversation lesson/i);
      expect(audio).toBeInTheDocument();
    });

    it('renders empty placeholder when audioUrl is missing', () => {
      render(<AudioPlayer audioUrl="" title="Missing Audio Lesson" />);

      expect(screen.getByText(/audio recording unavailable/i)).toBeInTheDocument();
      expect(
        screen.getByText(/please refer to the transcript below/i),
      ).toBeInTheDocument();
    });
  });

  describe('TranscriptViewer', () => {
    const englishTranscript = 'Speaker A: Hello, how are you today?\nSpeaker B: I am doing very well, thank you.';
    const vietnameseTranscript = 'Người A: Xin chào, hôm nay bạn thế nào?\nNgười B: Tôi rất khỏe, cảm ơn bạn.';

    it('renders empty state when no transcript is provided', () => {
      render(<TranscriptViewer transcript="" />);
      expect(
        screen.getByText(/no transcript available for this lesson/i),
      ).toBeInTheDocument();
    });

    it('renders transcript toggle button with transcript hidden initially', () => {
      render(
        <TranscriptViewer
          transcript={englishTranscript}
          transcriptVi={vietnameseTranscript}
        />,
      );

      expect(screen.getByText('Lesson Transcript')).toBeInTheDocument();
      const toggleBtn = screen.getByRole('button', { name: /show transcript/i });
      expect(toggleBtn).toBeInTheDocument();
      expect(screen.queryByText(/Hello, how are you today/i)).not.toBeInTheDocument();
    });

    it('expands transcript and toggles between English and Vietnamese', async () => {
      const user = userEvent.setup();

      render(
        <TranscriptViewer
          transcript={englishTranscript}
          transcriptVi={vietnameseTranscript}
        />,
      );

      // 1. Expand transcript
      const toggleBtn = screen.getByRole('button', { name: /show transcript/i });
      await user.click(toggleBtn);

      expect(screen.getByText(/Hello, how are you today/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hide transcript/i })).toBeInTheDocument();

      // 2. Switch to Vietnamese translation
      const translateBtn = screen.getByRole('button', { name: /english/i });
      await user.click(translateBtn);

      expect(screen.getByText(/Xin chào, hôm nay bạn thế nào/i)).toBeInTheDocument();
      expect(screen.queryByText(/Hello, how are you today/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tiếng việt/i })).toBeInTheDocument();
    });
  });

  describe('ReadingArticleCard', () => {
    const mockArticle: ReadingArticleListItem = {
      id: 'article-1',
      slug: 'bilingual-brain',
      title: 'The Bilingual Brain',
      titleVi: 'Bộ Não Song Ngữ',
      summary: 'Exploring how mastering two languages improves cognitive flexibility.',
      topic: 'Science & Brain',
      difficulty: 'MEDIUM',
      readingTime: 6,
      level: 'INTERMEDIATE',
      isCompleted: true,
      lastScore: 90,
      quiz: {
        id: 'quiz-2',
        title: 'Bilingual Brain Quiz',
        questionCount: 3,
        passingScore: 70,
      },
      createdAt: '2026-10-10',
      updatedAt: '2026-10-10',
    };

    it('renders title, topics, reading duration, and completion badge', () => {
      render(
        <MemoryRouter>
          <ReadingArticleCard article={mockArticle} />
        </MemoryRouter>,
      );

      expect(screen.getByText('The Bilingual Brain')).toBeInTheDocument();
      expect(screen.getByText('Bộ Não Song Ngữ')).toBeInTheDocument();
      expect(screen.getByText('Science & Brain')).toBeInTheDocument();
      expect(screen.getByText('6 min read')).toBeInTheDocument();
      expect(screen.getByText('3 questions')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('(90%)')).toBeInTheDocument();

      const link = screen.getByRole('link', { name: /continue/i });
      expect(link).toHaveAttribute('href', '/reading/article-1');
    });
  });
});
