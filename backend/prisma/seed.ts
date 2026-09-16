import {
  PrismaClient,
  Prisma,
  UserRole,
  EnglishLevel,
  Difficulty,
  VocabularyStatus,
  ActivityType,
  QuestionType,
  MessageRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for English Learning Web App...');

  // ==============================================
  // 1. Clean existing data (safe cascade order)
  // ==============================================
  console.log('Cleaning existing records...');
  await prisma.conversationMessage.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.dailyGoal.deleteMany({});
  await prisma.learningActivity.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.readingArticle.deleteMany({});
  await prisma.listeningLesson.deleteMany({});
  await prisma.grammarExercise.deleteMany({});
  await prisma.grammarLesson.deleteMany({});
  await prisma.userVocabulary.deleteMany({});
  await prisma.vocabulary.deleteMany({});
  await prisma.vocabularyTopic.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // ==============================================
  // 2. Seed Users & UserProfiles
  // ==============================================
  console.log('Seeding users...');
  const defaultPasswordHash = bcrypt.hashSync('Learner123!', 10);
  const teacherPasswordHash = bcrypt.hashSync('Teacher123!', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);

  const learner = await prisma.user.create({
    data: {
      id: 'cb9c0c5b-9aaa-4501-84f4-9a617c7feef3',
      email: 'learner@example.com',
      password: defaultPasswordHash,
      name: 'Nguyễn Văn Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      role: UserRole.LEARNER,
      level: EnglishLevel.INTERMEDIATE,
      profile: {
        create: {
          targetLevel: EnglishLevel.UPPER_INTERMEDIATE,
          nativeLanguage: 'vi',
          dailyGoalMinutes: 20,
          streakDays: 5,
          totalXp: 480,
        },
      },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: teacherPasswordHash,
      name: 'Cô Hương Duyên',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
      role: UserRole.TEACHER,
      level: EnglishLevel.PROFICIENT,
      profile: {
        create: {
          targetLevel: EnglishLevel.PROFICIENT,
          nativeLanguage: 'vi',
          dailyGoalMinutes: 30,
          streakDays: 45,
          totalXp: 3200,
        },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPasswordHash,
      name: 'Quản trị viên',
      role: UserRole.ADMIN,
      level: EnglishLevel.ADVANCED,
      profile: {
        create: {
          targetLevel: EnglishLevel.PROFICIENT,
          nativeLanguage: 'vi',
          dailyGoalMinutes: 15,
          streakDays: 12,
          totalXp: 1500,
        },
      },
    },
  });

  // ==============================================
  // 3. Seed Vocabulary Topics (10+ topics)
  // ==============================================
  console.log('Seeding vocabulary topics...');
  const topicsData = [
    {
      slug: 'daily-routines',
      title: 'Daily Routines & Habits',
      titleVi: 'Thói quen & Sinh hoạt hàng ngày',
      description: 'Common verbs and phrases used to describe everyday schedules and activities.',
      thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.BEGINNER,
      order: 1,
    },
    {
      slug: 'food-and-dining',
      title: 'Food & Dining Out',
      titleVi: 'Ẩm thực & Đi ăn nhà hàng',
      description: 'Essential vocabulary for ordering meals, cooking, and talking about tastes.',
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.BEGINNER,
      order: 2,
    },
    {
      slug: 'travel-transport',
      title: 'Travel & Transportation',
      titleVi: 'Du lịch & Phương tiện đi lại',
      description: 'Words and expressions for airports, trains, hotels, and booking adventures.',
      thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.ELEMENTARY,
      order: 3,
    },
    {
      slug: 'work-career',
      title: 'Work & Professional Life',
      titleVi: 'Công việc & Đời sống công sở',
      description: 'Business terms, workplace meetings, resumes, and career development.',
      thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.INTERMEDIATE,
      order: 4,
    },
    {
      slug: 'technology-digital',
      title: 'Technology & Digital World',
      titleVi: 'Công nghệ & Thế giới kỹ thuật số',
      description: 'Modern devices, software, internet culture, and AI advancements.',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.INTERMEDIATE,
      order: 5,
    },
    {
      slug: 'health-wellness',
      title: 'Health & Wellness',
      titleVi: 'Sức khỏe & Lối sống lành mạnh',
      description: 'Medical visits, fitness routines, symptoms, and mental well-being.',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.ELEMENTARY,
      order: 6,
    },
    {
      slug: 'education-learning',
      title: 'Education & Study Skills',
      titleVi: 'Giáo dục & Kỹ năng học tập',
      description: 'University terms, academic subjects, exams, and effective study methods.',
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.ELEMENTARY,
      order: 7,
    },
    {
      slug: 'shopping-fashion',
      title: 'Shopping & Clothes',
      titleVi: 'Mua sắm & Thời trang',
      description: 'Clothing styles, bargains, payments, and online shopping terminology.',
      thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.BEGINNER,
      order: 8,
    },
    {
      slug: 'nature-environment',
      title: 'Nature & Environment',
      titleVi: 'Thiên nhiên & Môi trường',
      description: 'Climate, wildlife, ecosystems, and environmental conservation.',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.UPPER_INTERMEDIATE,
      order: 9,
    },
    {
      slug: 'entertainment-hobbies',
      title: 'Entertainment & Hobbies',
      titleVi: 'Giải trí & Sở thích',
      description: 'Movies, music, sports, gaming, and creative leisure activities.',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.BEGINNER,
      order: 10,
    },
    {
      slug: 'family-relationships',
      title: 'Family & Relationships',
      titleVi: 'Gia đình & Các mối quan hệ',
      description: 'Family members, friendships, emotional connections, and social gatherings.',
      thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80',
      level: EnglishLevel.BEGINNER,
      order: 11,
    },
  ];

  const createdTopics = new Map<string, string>();
  for (const topic of topicsData) {
    const record = await prisma.vocabularyTopic.create({ data: topic });
    createdTopics.set(record.slug, record.id);
  }

  // ==============================================
  // 4. Seed Vocabularies (50+ words across topics)
  // ==============================================
  console.log('Seeding vocabulary words...');
  const vocabulariesData = [
    // Daily Routines
    {
      topicSlug: 'daily-routines',
      word: 'Wake up',
      phonetic: '/weɪk ʌp/',
      partOfSpeech: 'phrasal verb',
      meaning: 'To stop sleeping and become conscious.',
      meaningVi: 'Thức giấc, tỉnh dậy.',
      exampleSentence: 'I usually wake up at 6:30 AM every weekday.',
      exampleSentenceVi: 'Tôi thường thức dậy vào lúc 6:30 sáng các ngày trong tuần.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'daily-routines',
      word: 'Commute',
      phonetic: '/kəˈmjuːt/',
      partOfSpeech: 'verb',
      meaning: 'To travel regularly between one’s home and one’s place of work.',
      meaningVi: 'Đi lại đều đặn giữa nơi ở và nơi làm việc.',
      exampleSentence: 'It takes him 45 minutes to commute to downtown Hanoi by bus.',
      exampleSentenceVi: 'Anh ấy mất 45 phút để đi xe buýt vào trung tâm Hà Nội làm việc.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'daily-routines',
      word: 'Punctual',
      phonetic: '/ˈpʌŋktʃuəl/',
      partOfSpeech: 'adjective',
      meaning: 'Doing something or arriving at the right time; not late.',
      meaningVi: 'Đúng giờ, không bao giờ trễ.',
      exampleSentence: 'She is always punctual for meetings and lectures.',
      exampleSentenceVi: 'Cô ấy luôn luôn đúng giờ trong các cuộc họp và buổi giảng.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'daily-routines',
      word: 'Unwind',
      phonetic: '/ʌnˈwaɪnd/',
      partOfSpeech: 'verb',
      meaning: 'To relax after a period of work or tension.',
      meaningVi: 'Thư giãn, xả hơi sau giờ làm việc căng thẳng.',
      exampleSentence: 'Listening to calm music helps me unwind in the evening.',
      exampleSentenceVi: 'Nghe nhạc nhẹ giúp tôi thư giãn vào buổi tối.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'daily-routines',
      word: 'Chores',
      phonetic: '/tʃɔːrz/',
      partOfSpeech: 'noun (plural)',
      meaning: 'Routine household tasks such as cleaning and washing dishes.',
      meaningVi: 'Công việc vặt trong nhà (dọn dẹp, rửa bát...).',
      exampleSentence: 'We usually share household chores at the weekend.',
      exampleSentenceVi: 'Chúng tôi thường chia sẻ công việc nhà vào cuối tuần.',
      difficulty: Difficulty.EASY,
    },

    // Food & Dining Out
    {
      topicSlug: 'food-and-dining',
      word: 'Delicious',
      phonetic: '/dɪˈlɪʃəs/',
      partOfSpeech: 'adjective',
      meaning: 'Having a very pleasant taste or smell.',
      meaningVi: 'Ngon miệng, thơm ngon.',
      exampleSentence: 'This traditional Vietnamese pho is delicious and aromatic.',
      exampleSentenceVi: 'Món phở truyền thống Việt Nam này rất ngon và đậm đà hương thơm.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'food-and-dining',
      word: 'Appetizer',
      phonetic: '/ˈæpɪtaɪzər/',
      partOfSpeech: 'noun',
      meaning: 'A small dish of food served before the main part of a meal.',
      meaningVi: 'Món khai vị.',
      exampleSentence: 'We ordered crispy spring rolls as an appetizer.',
      exampleSentenceVi: 'Chúng tôi gọi món nem rán giòn làm món khai vị.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'food-and-dining',
      word: 'Beverage',
      phonetic: '/ˈbevərɪdʒ/',
      partOfSpeech: 'noun',
      meaning: 'A drink of any type, particularly excluding pure water.',
      meaningVi: 'Đồ uống, thức uống các loại.',
      exampleSentence: 'The cafe offers a wide selection of hot and iced beverages.',
      exampleSentenceVi: 'Quán cà phê phục vụ rất nhiều loại đồ uống nóng và đá.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'food-and-dining',
      word: 'Recipe',
      phonetic: '/ˈresəpi/',
      partOfSpeech: 'noun',
      meaning: 'A set of instructions for preparing a particular dish.',
      meaningVi: 'Công thức nấu ăn.',
      exampleSentence: 'My grandmother shared her secret recipe for beef stew.',
      exampleSentenceVi: 'Bà tôi đã chia sẻ công thức bí truyền nấu món bò kho.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'food-and-dining',
      word: 'Savory',
      phonetic: '/ˈseɪvəri/',
      partOfSpeech: 'adjective',
      meaning: 'Belonging to the category that is salty or spicy rather than sweet.',
      meaningVi: 'Đậm đà, có vị mặn thơm ngon (không ngọt).',
      exampleSentence: 'I prefer savory breakfasts like noodles rather than sweet pancakes.',
      exampleSentenceVi: 'Tôi thích bữa sáng đậm vị như bún phở hơn là bánh ngọt.',
      difficulty: Difficulty.MEDIUM,
    },

    // Travel & Transport
    {
      topicSlug: 'travel-transport',
      word: 'Itinerary',
      phonetic: '/aɪˈtɪnərəri/',
      partOfSpeech: 'noun',
      meaning: 'A detailed plan or route of a journey.',
      meaningVi: 'Lịch trình, lộ trình chuyến đi.',
      exampleSentence: 'Our travel itinerary includes visits to Da Nang, Hoi An, and Hue.',
      exampleSentenceVi: 'Lịch trình du lịch của chúng tôi bao gồm tham quan Đà Nẵng, Hội An và Huế.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'travel-transport',
      word: 'Boarding pass',
      phonetic: '/ˈbɔːrdɪŋ pæs/',
      partOfSpeech: 'noun',
      meaning: 'A document given to a passenger giving permission to get on an airplane.',
      meaningVi: 'Thẻ lên máy bay.',
      exampleSentence: 'Please present your boarding pass and passport at Gate 4.',
      exampleSentenceVi: 'Vui lòng xuất trình thẻ lên máy bay và hộ chiếu tại Cửa số 4.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'travel-transport',
      word: 'Accommodation',
      phonetic: '/əˌkɑːməˈdeɪʃn/',
      partOfSpeech: 'noun',
      meaning: 'A place to live, work, or stay in, especially temporarily during travel.',
      meaningVi: 'Chỗ ở, nơi lưu trú khi đi du lịch.',
      exampleSentence: 'We booked beachfront accommodation at a reasonable price.',
      exampleSentenceVi: 'Chúng tôi đã đặt chỗ ở sát bờ biển với mức giá rất hợp lý.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'travel-transport',
      word: 'Sightseeing',
      phonetic: '/ˈsaɪtsiːɪŋ/',
      partOfSpeech: 'noun',
      meaning: 'The activity of visiting places of interest in a particular location.',
      meaningVi: 'Ngắm cảnh, tham quan danh lam thắng cảnh.',
      exampleSentence: 'We spent the entire morning sightseeing around the Old Quarter.',
      exampleSentenceVi: 'Chúng tôi dành cả buổi sáng đi ngắm cảnh quanh Phố Cổ.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'travel-transport',
      word: 'Depart',
      phonetic: '/dɪˈpɑːrt/',
      partOfSpeech: 'verb',
      meaning: 'To leave, especially on a journey.',
      meaningVi: 'Khởi hành, rời đi.',
      exampleSentence: 'The train to Sapa will depart promptly at 9:00 PM.',
      exampleSentenceVi: 'Chuyến tàu đi Sa Pa sẽ khởi hành đúng 9 giờ tối.',
      difficulty: Difficulty.EASY,
    },

    // Work & Career
    {
      topicSlug: 'work-career',
      word: 'Collaborate',
      phonetic: '/kəˈlæbəreɪt/',
      partOfSpeech: 'verb',
      meaning: 'To work jointly on an activity or project.',
      meaningVi: 'Cộng tác, hợp tác làm việc cùng nhau.',
      exampleSentence: 'Our engineering and marketing teams collaborate closely on new launches.',
      exampleSentenceVi: 'Đội ngũ kỹ thuật và tiếp thị hợp tác chặt chẽ cho đợt ra mắt mới.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'work-career',
      word: 'Deadline',
      phonetic: '/ˈdedlaɪn/',
      partOfSpeech: 'noun',
      meaning: 'The latest time or date by which something should be completed.',
      meaningVi: 'Hạn chót, thời hạn hoàn thành công việc.',
      exampleSentence: 'We must work overtime to meet the project deadline this Friday.',
      exampleSentenceVi: 'Chúng ta phải làm thêm giờ để kịp hạn chót dự án vào thứ Sáu này.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'work-career',
      word: 'Negotiate',
      phonetic: '/nɪˈɡoʊʃieɪt/',
      partOfSpeech: 'verb',
      meaning: 'To discuss something formally in order to reach an agreement.',
      meaningVi: 'Đàm phán, thương lượng.',
      exampleSentence: 'She successfully negotiated a higher salary and flexible hours.',
      exampleSentenceVi: 'Cô ấy đã đàm phán thành công mức lương cao hơn và giờ làm linh hoạt.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'work-career',
      word: 'Promotion',
      phonetic: '/prəˈmoʊʃn/',
      partOfSpeech: 'noun',
      meaning: 'The act of raising someone to a higher position or rank at work.',
      meaningVi: 'Sự thăng chức, thăng tiến sự nghiệp.',
      exampleSentence: 'His dedication earned him a well-deserved promotion to manager.',
      exampleSentenceVi: 'Sự cống hiến đã giúp anh ấy nhận được sự thăng chức xứng đáng lên vị trí quản lý.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'work-career',
      word: 'Resume',
      phonetic: '/ˈrezəmeɪ/',
      partOfSpeech: 'noun',
      meaning: 'A brief summary of one’s education, qualifications, and previous experience.',
      meaningVi: 'Sơ yếu lý lịch, CV xin việc.',
      exampleSentence: 'Remember to tailor your resume for each specific job application.',
      exampleSentenceVi: 'Hãy nhớ chỉnh sửa hồ sơ xin việc của bạn cho phù hợp với từng vị trí ứng tuyển.',
      difficulty: Difficulty.EASY,
    },

    // Technology & Digital World
    {
      topicSlug: 'technology-digital',
      word: 'Algorithm',
      phonetic: '/ˈælɡərɪðəm/',
      partOfSpeech: 'noun',
      meaning: 'A process or set of rules followed in calculations or problem-solving operations.',
      meaningVi: 'Thuật toán, quy tắc xử lý dữ liệu.',
      exampleSentence: 'Social media algorithms determine the content you see on your feed.',
      exampleSentenceVi: 'Các thuật toán mạng xã hội quyết định nội dung bạn nhìn thấy trên bảng tin.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'technology-digital',
      word: 'Artificial Intelligence',
      phonetic: '/ˌɑːrtɪfɪʃl ɪnˈtelɪdʒəns/',
      partOfSpeech: 'noun',
      meaning: 'Computer systems able to perform tasks normally requiring human intelligence.',
      meaningVi: 'Trí tuệ nhân tạo (AI).',
      exampleSentence: 'Artificial intelligence is transforming language learning apps worldwide.',
      exampleSentenceVi: 'Trí tuệ nhân tạo đang làm thay đổi các ứng dụng học ngoại ngữ trên toàn thế giới.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'technology-digital',
      word: 'Cybersecurity',
      phonetic: '/ˌsaɪbərsɪˈkjʊrəti/',
      partOfSpeech: 'noun',
      meaning: 'The state of being protected against the criminal or unauthorized use of electronic data.',
      meaningVi: 'An ninh mạng, an toàn thông tin.',
      exampleSentence: 'Strong passwords and two-factor authentication improve cybersecurity.',
      exampleSentenceVi: 'Mật khẩu mạnh và xác thực hai yếu tố giúp nâng cao an ninh mạng.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'technology-digital',
      word: 'Browse',
      phonetic: '/braʊz/',
      partOfSpeech: 'verb',
      meaning: 'To look through a book or scan information on the internet.',
      meaningVi: 'Duyệt web, xem lướt thông tin.',
      exampleSentence: 'You can browse thousands of free online courses from home.',
      exampleSentenceVi: 'Bạn có thể duyệt qua hàng ngàn khóa học trực tuyến miễn phí ngay tại nhà.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'technology-digital',
      word: 'Interface',
      phonetic: '/ˈɪntərfeɪs/',
      partOfSpeech: 'noun',
      meaning: 'The means by which the user and a computer system interact.',
      meaningVi: 'Giao diện người dùng.',
      exampleSentence: 'The web application features a clean, intuitive user interface.',
      exampleSentenceVi: 'Ứng dụng web sở hữu giao diện người dùng trực quan và gọn gàng.',
      difficulty: Difficulty.MEDIUM,
    },

    // Health & Wellness
    {
      topicSlug: 'health-wellness',
      word: 'Nutritious',
      phonetic: '/nuːˈtrɪʃəs/',
      partOfSpeech: 'adjective',
      meaning: 'Containing many of the substances which help the body to grow and stay healthy.',
      meaningVi: 'Giàu chất dinh dưỡng, bổ dưỡng.',
      exampleSentence: 'Fresh fruits and green vegetables provide nutritious benefits for your body.',
      exampleSentenceVi: 'Hoa quả tươi và rau xanh đem lại nhiều dưỡng chất cho cơ thể bạn.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'health-wellness',
      word: 'Immunity',
      phonetic: '/ɪˈmjuːnəti/',
      partOfSpeech: 'noun',
      meaning: 'Protection against a particular disease or illness.',
      meaningVi: 'Khả năng miễn dịch, sức đề kháng.',
      exampleSentence: 'Regular exercise and quality sleep bolster your immune system.',
      exampleSentenceVi: 'Tập thể dục đều đặn và ngủ đủ giấc giúp tăng cường hệ miễn dịch của bạn.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'health-wellness',
      word: 'Hydrated',
      phonetic: '/ˈhaɪdreɪtɪd/',
      partOfSpeech: 'adjective',
      meaning: 'Having absorbed enough water or liquid.',
      meaningVi: 'Được cung cấp đủ nước.',
      exampleSentence: 'Drink at least two liters of water daily to stay well hydrated.',
      exampleSentenceVi: 'Uống ít nhất hai lít nước mỗi ngày để giữ cho cơ thể luôn đủ nước.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'health-wellness',
      word: 'Symptom',
      phonetic: '/ˈsɪmptəm/',
      partOfSpeech: 'noun',
      meaning: 'A physical or mental feature indicating a condition of disease.',
      meaningVi: 'Triệu chứng (bệnh).',
      exampleSentence: 'A high fever and sore throat are common symptoms of the flu.',
      exampleSentenceVi: 'Sốt cao và đau họng là các triệu chứng thông thường của bệnh cúm.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'health-wellness',
      word: 'Meditation',
      phonetic: '/ˌmedɪˈteɪʃn/',
      partOfSpeech: 'noun',
      meaning: 'The practice of focusing one’s mind to achieve mental clarity and emotional calmness.',
      meaningVi: 'Thiền định, phương pháp thư giãn tinh thần.',
      exampleSentence: 'Ten minutes of daily meditation reduces anxiety significantly.',
      exampleSentenceVi: 'Mười phút thiền mỗi ngày giúp giảm bớt lo âu đáng kể.',
      difficulty: Difficulty.MEDIUM,
    },

    // Education & Learning
    {
      topicSlug: 'education-learning',
      word: 'Curriculum',
      phonetic: '/kəˈrɪkjələm/',
      partOfSpeech: 'noun',
      meaning: 'The subjects comprising a course of study in a school or college.',
      meaningVi: 'Chương trình giảng dạy, giáo trình.',
      exampleSentence: 'The school curriculum includes both theoretical science and practical coding.',
      exampleSentenceVi: 'Chương trình học bao gồm cả khoa học lý thuyết lẫn thực hành lập trình.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'education-learning',
      word: 'Proficiency',
      phonetic: '/prəˈfɪʃnsi/',
      partOfSpeech: 'noun',
      meaning: 'A high degree of competence or skill in a particular activity.',
      meaningVi: 'Sự thành thạo, mức độ tinh thông.',
      exampleSentence: 'Passing the IELTS exam demonstrates high English language proficiency.',
      exampleSentenceVi: 'Đạt chứng chỉ IELTS chứng minh mức độ thành thạo tiếng Anh cao.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'education-learning',
      word: 'Assignment',
      phonetic: '/əˈsaɪnmənt/',
      partOfSpeech: 'noun',
      meaning: 'A piece of work or job that you are given to do.',
      meaningVi: 'Bài tập được giao, nhiệm vụ học tập.',
      exampleSentence: 'Students must submit their reading assignments before midnight.',
      exampleSentenceVi: 'Sinh viên phải nộp bài tập đọc trước nửa đêm.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'education-learning',
      word: 'Scholarship',
      phonetic: '/ˈskɑːlərʃɪp/',
      partOfSpeech: 'noun',
      meaning: 'Financial aid awarded to a student to support their education.',
      meaningVi: 'Học bổng.',
      exampleSentence: 'She received a full scholarship to study abroad in Melbourne.',
      exampleSentenceVi: 'Cô ấy đã giành được học bổng toàn phần để đi du học tại Melbourne.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'education-learning',
      word: 'Comprehension',
      phonetic: '/ˌkɑːmprɪˈhenʃn/',
      partOfSpeech: 'noun',
      meaning: 'The ability to understand something thoroughly.',
      meaningVi: 'Khả năng hiểu, đọc hiểu.',
      exampleSentence: 'This reading quiz tests your comprehension of academic passages.',
      exampleSentenceVi: 'Bài kiểm tra đọc này đánh giá khả năng đọc hiểu các đoạn văn học thuật.',
      difficulty: Difficulty.MEDIUM,
    },

    // Shopping & Clothes
    {
      topicSlug: 'shopping-fashion',
      word: 'Bargain',
      phonetic: '/ˈbɑːrɡən/',
      partOfSpeech: 'noun',
      meaning: 'Something on sale at a lower price than its true value.',
      meaningVi: 'Món hời, giá rẻ bất ngờ.',
      exampleSentence: 'This genuine leather jacket was a real bargain at half price.',
      exampleSentenceVi: 'Chiếc áo khoác da thật này là một món hời thực sự khi được giảm nửa giá.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'shopping-fashion',
      word: 'Receipt',
      phonetic: '/rɪˈsiːt/',
      partOfSpeech: 'noun',
      meaning: 'A printed statement acknowledging that something has been paid for.',
      meaningVi: 'Hóa đơn, biên lai thanh toán.',
      exampleSentence: 'Keep your receipt if you want to exchange or return the item.',
      exampleSentenceVi: 'Hãy giữ lại hóa đơn nếu bạn muốn đổi hoặc trả lại món đồ.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'shopping-fashion',
      word: 'Affordable',
      phonetic: '/əˈfɔːrdəbl/',
      partOfSpeech: 'adjective',
      meaning: 'Inexpensive and reasonably priced.',
      meaningVi: 'Giá cả phải chăng, vừa túi tiền.',
      exampleSentence: 'They sell high quality stationery at very affordable prices.',
      exampleSentenceVi: 'Họ bán văn phòng phẩm chất lượng cao với giá rất phải chăng.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'shopping-fashion',
      word: 'Refund',
      phonetic: '/ˈriːfʌnd/',
      partOfSpeech: 'noun',
      meaning: 'A repayment of a sum of money, typically to a dissatisfied customer.',
      meaningVi: 'Khoản tiền hoàn lại.',
      exampleSentence: 'The store gave me a full refund because the shoes did not fit.',
      exampleSentenceVi: 'Cửa hàng đã hoàn tiền đầy đủ cho tôi vì đôi giày không vừa cỡ.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'shopping-fashion',
      word: 'Warranty',
      phonetic: '/ˈwɔːrənti/',
      partOfSpeech: 'noun',
      meaning: 'A written guarantee promising to repair or replace an article if necessary.',
      meaningVi: 'Phiếu bảo hành, cam kết bảo hành.',
      exampleSentence: 'All electronics purchased here come with a two-year warranty.',
      exampleSentenceVi: 'Tất cả đồ điện tử mua ở đây đều đi kèm chế độ bảo hành hai năm.',
      difficulty: Difficulty.MEDIUM,
    },

    // Nature & Environment
    {
      topicSlug: 'nature-environment',
      word: 'Biodiversity',
      phonetic: '/ˌbaɪoʊdaɪˈvɜːrsəti/',
      partOfSpeech: 'noun',
      meaning: 'The variety of plant and animal life in the world or in a particular habitat.',
      meaningVi: 'Đa dạng sinh học.',
      exampleSentence: 'Cuc Phuong National Park is known for its remarkable biodiversity.',
      exampleSentenceVi: 'Vườn quốc gia Cúc Phương nổi tiếng với sự đa dạng sinh học đáng kinh ngạc.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'nature-environment',
      word: 'Renewable',
      phonetic: '/rɪˈnuːəbl/',
      partOfSpeech: 'adjective',
      meaning: 'Capable of being replenished naturally over time, like solar or wind power.',
      meaningVi: 'Có thể tái tạo (năng lượng tái tạo).',
      exampleSentence: 'Solar and wind power are leading forms of renewable energy.',
      exampleSentenceVi: 'Năng lượng mặt trời và gió là những dạng năng lượng tái tạo hàng đầu.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'nature-environment',
      word: 'Conservation',
      phonetic: '/ˌkɑːnsərˈveɪʃn/',
      partOfSpeech: 'noun',
      meaning: 'The prevention of wasteful use of a resource and protection of nature.',
      meaningVi: 'Sự bảo tồn tài nguyên và môi trường.',
      exampleSentence: 'Wildlife conservation efforts help protect endangered sea turtles.',
      exampleSentenceVi: 'Các nỗ lực bảo tồn động vật hoang dã giúp bảo vệ loài rùa biển quý hiếm.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'nature-environment',
      word: 'Pollution',
      phonetic: '/pəˈluːʃn/',
      partOfSpeech: 'noun',
      meaning: 'The presence in the environment of a substance that has harmful effects.',
      meaningVi: 'Sự ô nhiễm môi trường.',
      exampleSentence: 'Air pollution is a pressing challenge in major metropolitan areas.',
      exampleSentenceVi: 'Ô nhiễm không khí là một thách thức cấp bách tại các khu đô thị lớn.',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'nature-environment',
      word: 'Ecosystem',
      phonetic: '/ˈiːkoʊsɪstəm/',
      partOfSpeech: 'noun',
      meaning: 'A biological community of interacting organisms and their physical environment.',
      meaningVi: 'Hệ sinh thái.',
      exampleSentence: 'Mangrove forests form a crucial ecosystem protecting coastal areas.',
      exampleSentenceVi: 'Rừng ngập mặn tạo nên một hệ sinh thái quan trọng che chắn cho vùng ven biển.',
      difficulty: Difficulty.HARD,
    },

    // Entertainment & Hobbies
    {
      topicSlug: 'entertainment-hobbies',
      word: 'Blockbuster',
      phonetic: '/ˈblɑːkbʌstər/',
      partOfSpeech: 'noun',
      meaning: 'A thing of great power or size, especially a film or book that is a great commercial success.',
      meaningVi: 'Phim bom tấn, tác phẩm ăn khách.',
      exampleSentence: 'The new superhero blockbuster smashed box office records worldwide.',
      exampleSentenceVi: 'Bộ phim siêu anh hùng bom tấn mới đã phá vỡ các kỷ lục phòng vé thế giới.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'entertainment-hobbies',
      word: 'Genre',
      phonetic: '/ˈʒɑːnrə/',
      partOfSpeech: 'noun',
      meaning: 'A category of artistic composition characterized by similarities in form or style.',
      meaningVi: 'Thể loại (âm nhạc, văn học, phim ảnh).',
      exampleSentence: 'What music genre do you enjoy listening to while studying?',
      exampleSentenceVi: 'Bạn thích nghe thể loại nhạc nào trong lúc học bài?',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'entertainment-hobbies',
      word: 'Enthusiast',
      phonetic: '/ɪnˈθuːziæst/',
      partOfSpeech: 'noun',
      meaning: 'A person who is highly interested in a particular activity or subject.',
      meaningVi: 'Người say mê, người có niềm đam mê cuồng nhiệt.',
      exampleSentence: 'He is a photography enthusiast who travels every weekend.',
      exampleSentenceVi: 'Anh ấy là một người say mê nhiếp ảnh và thường đi du lịch vào mỗi cuối tuần.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'entertainment-hobbies',
      word: 'Leisure',
      phonetic: '/ˈliːʒər/',
      partOfSpeech: 'noun',
      meaning: 'Time when one is not working or occupied; free time.',
      meaningVi: 'Thời gian rảnh rỗi, giải trí nghỉ ngơi.',
      exampleSentence: 'In her leisure time, she likes baking cookies and reading poetry.',
      exampleSentenceVi: 'Vào thời gian rảnh rỗi, cô ấy thích làm bánh quy và đọc thơ.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'entertainment-hobbies',
      word: 'Instrument',
      phonetic: '/ˈɪnstrəmənt/',
      partOfSpeech: 'noun',
      meaning: 'An object or device for producing musical sounds.',
      meaningVi: 'Nhạc cụ.',
      exampleSentence: 'The acoustic guitar is an accessible musical instrument for beginners.',
      exampleSentenceVi: 'Đàn guitar mộc là một loại nhạc cụ rất dễ tiếp cận cho người mới bắt đầu.',
      difficulty: Difficulty.EASY,
    },

    // Family & Relationships
    {
      topicSlug: 'family-relationships',
      word: 'Sibling',
      phonetic: '/ˈsɪblɪŋ/',
      partOfSpeech: 'noun',
      meaning: 'Each of two or more children having one or both parents in common; a brother or sister.',
      meaningVi: 'Anh chị em ruột trong gia đình.',
      exampleSentence: 'Do you have any siblings, or are you an only child?',
      exampleSentenceVi: 'Bạn có anh chị em ruột không, hay bạn là con một?',
      difficulty: Difficulty.EASY,
    },
    {
      topicSlug: 'family-relationships',
      word: 'Empathy',
      phonetic: '/ˈempəθi/',
      partOfSpeech: 'noun',
      meaning: 'The ability to understand and share the feelings of another person.',
      meaningVi: 'Sự thấu cảm, lòng đồng cảm.',
      exampleSentence: 'Empathy is the cornerstone of building long-lasting friendships.',
      exampleSentenceVi: 'Sự thấu cảm là nền tảng để xây dựng những tình bạn lâu dài.',
      difficulty: Difficulty.HARD,
    },
    {
      topicSlug: 'family-relationships',
      word: 'Reunion',
      phonetic: '/ˌriːˈjuːniən/',
      partOfSpeech: 'noun',
      meaning: 'A social gathering of people who have not seen each other for some time.',
      meaningVi: 'Sự đoàn tụ, buổi sum họp gia đình.',
      exampleSentence: 'Tet holiday is a special time for family reunions in Vietnam.',
      exampleSentenceVi: 'Dịp Tết Nguyên Đán là thời khắc đặc biệt để các gia đình Việt Nam sum họp đoàn tụ.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'family-relationships',
      word: 'Companion',
      phonetic: '/kəmˈpænjən/',
      partOfSpeech: 'noun',
      meaning: 'A person or animal with whom one spends a lot of time or travels.',
      meaningVi: 'Bạn đồng hành, người bầu bạn.',
      exampleSentence: 'Her pet dog has been her faithful companion for over ten years.',
      exampleSentenceVi: 'Chú chó cưng là người bạn đồng hành trung thành của cô ấy suốt hơn mười năm qua.',
      difficulty: Difficulty.MEDIUM,
    },
    {
      topicSlug: 'family-relationships',
      word: 'Affection',
      phonetic: '/əˈfekʃn/',
      partOfSpeech: 'noun',
      meaning: 'A gentle feeling of fondness or liking.',
      meaningVi: 'Tình cảm yêu mến, sự quý mến.',
      exampleSentence: 'The grandparents showed great affection towards all their grandchildren.',
      exampleSentenceVi: 'Ông bà dành rất nhiều tình cảm yêu thương cho tất cả các cháu của mình.',
      difficulty: Difficulty.HARD,
    },
  ];

  const createdVocabs: { id: string; word: string }[] = [];
  for (const item of vocabulariesData) {
    const topicId = createdTopics.get(item.topicSlug);
    if (topicId) {
      const { topicSlug, ...vocabFields } = item;
      const created = await prisma.vocabulary.create({
        data: {
          ...vocabFields,
          topicId,
        },
      });
      createdVocabs.push({ id: created.id, word: created.word });
    }
  }

  // Seed sample UserVocabulary for the learner user
  console.log('Seeding user vocabularies...');
  const learnerVocabs = createdVocabs.slice(0, 10);
  for (let i = 0; i < learnerVocabs.length; i++) {
    const status =
      i < 4
        ? VocabularyStatus.MASTERED
        : i < 7
        ? VocabularyStatus.LEARNING
        : VocabularyStatus.REVIEWING;
    await prisma.userVocabulary.create({
      data: {
        userId: learner.id,
        vocabularyId: learnerVocabs[i].id,
        status,
        reviewCount: (i + 1) * 3,
        masteryScore: status === VocabularyStatus.MASTERED ? 95 : 60,
        lastReviewedAt: new Date(Date.now() - i * 86400000),
        nextReviewAt: new Date(Date.now() + (i + 1) * 86400000),
      },
    });
  }

  // ==============================================
  // 5. Seed Grammar Lessons (14 lessons across 8 categories)
  // ==============================================
  console.log('Seeding grammar lessons & exercises across 8 categories...');
  const grammarLessonsData = [
    // 1. TENSES (6 lessons)
    {
      slug: 'present-simple-tense',
      title: 'Present Simple Tense',
      titleVi: 'Thì Hiện Tại Đơn',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Usage, structures, and common rules for facts, habits, and general truths.',
      level: EnglishLevel.BEGINNER,
      order: 1,
      content: `
# Thì Hiện Tại Đơn (Present Simple Tense)

## 1. Công Dụng (Usage)
- Diễn tả một chân lý, sự thật hiển nhiên: *The sun rises in the east.*
- Diễn tả thói quen, hành động lặp đi lặp lại: *I drink coffee every morning.*
- Diễn tả lịch trình cố định: *The flight departs at 8:00 AM tomorrow.*

## 2. Công Thức (Form)
- **Khẳng định (+)**: S + V(s/es) + O
- **Phủ định (-)**: S + do/does not + V(nguyên mẫu)
- **Nghi vấn (?)**: Do/Does + S + V(nguyên mẫu)?

## 3. Dấu Hiệu Nhận Biết
Always, usually, often, sometimes, rarely, never, every day/week/month.
      `,
      exercises: [
        {
          instruction: 'Choose the correct form of the verb to complete the sentence.',
          question: 'She _____ (go) to work by motorbike every morning.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['go', 'goes', 'going', 'is go'],
          correctAnswer: 'goes',
          explanation: 'Subject "She" is third-person singular, so the verb takes "-es".',
          explanationVi: 'Chủ ngữ "She" là ngôi thứ 3 số ít nên động từ "go" phải thêm "-es" thành "goes".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the correct negative auxiliary verb.',
          question: 'They _____ not like spicy food.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'do',
          explanation: 'For plural subject "They", use auxiliary verb "do".',
          explanationVi: 'Chủ ngữ số nhiều "They" đi cùng trợ động từ phủ định "do" (do not / don’t).',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the error in the auxiliary verb.',
          question: 'He don\'t know how to drive a manual transmission car.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: "don't", correction: "doesn't" },
          correctAnswer: "doesn't",
          explanation: 'Third person singular subject "He" takes "doesn\'t", not "don\'t".',
          explanationVi: 'Chủ ngữ "He" là ngôi thứ 3 số ít, trợ động từ phủ định phải là "doesn\'t".',
          order: 3,
        },
      ],
    },
    {
      slug: 'present-continuous-tense',
      title: 'Present Continuous Tense',
      titleVi: 'Thì Hiện Tại Tiếp Diễn',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Express actions occurring right now or future arranged appointments.',
      level: EnglishLevel.BEGINNER,
      order: 2,
      content: `
# Thì Hiện Tại Tiếp Diễn (Present Continuous Tense)

## 1. Công Dụng
- Hành động đang diễn ra tại thời điểm nói: *Listen! Someone is knocking at the door.*
- Hành động tạm thời: *I am staying with my aunt this week.*
- Kế hoạch chắc chắn trong tương lai gần: *We are flying to Da Nang tomorrow.*

## 2. Công Thức
- **(+)**: S + am/is/are + V-ing
- **(-)**: S + am/is/are + not + V-ing
- **(?)**: Am/Is/Are + S + V-ing?
      `,
      exercises: [
        {
          instruction: 'Select the correct verb phrase.',
          question: 'Look! The kids _____ in the garden.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['play', 'is playing', 'are playing', 'played'],
          correctAnswer: 'are playing',
          explanation: '"The kids" is plural, so we use "are playing".',
          explanationVi: '"The kids" là danh từ số nhiều, đi kèm tín hiệu "Look!" nên dùng "are playing".',
          order: 1,
        },
        {
          instruction: 'Fill in the missing continuous verb form.',
          question: 'Right now, Linh is _____ (study) for her final English exam.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'studying',
          explanation: 'Add "-ing" to the verb "study".',
          explanationVi: 'Động từ "study" chuyển sang dạng tiếp diễn là "studying".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Correct the stative verb in continuous tense.',
          question: 'I am understanding this difficult grammar rule now.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'am understanding', correction: 'understand' },
          correctAnswer: 'understand',
          explanation: '"Understand" is a stative verb and is not used in the continuous form.',
          explanationVi: '"Understand" là động từ chỉ trạng thái nhận thức, không chia ở thì tiếp diễn.',
          order: 3,
        },
      ],
    },
    {
      slug: 'past-simple-tense',
      title: 'Past Simple Tense',
      titleVi: 'Thì Quá Khứ Đơn',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Describing completed actions in the past with specific time markers.',
      level: EnglishLevel.BEGINNER,
      order: 3,
      content: `
# Thì Quá Khứ Đơn (Past Simple Tense)

## 1. Công Dụng
- Hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ.
- Chuỗi các hành động liên tiếp trong quá khứ: *He came home, took a shower, and went to bed.*

## 2. Công Thức
- **(+)**: S + V2/ed
- **(-)**: S + did not + V(nguyên mẫu)
- **(?)**: Did + S + V(nguyên mẫu)?
      `,
      exercises: [
        {
          instruction: 'Choose the correct past form of the irregular verb.',
          question: 'Yesterday, we _____ (buy) some fresh fruits at the local market.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['buyed', 'bought', 'have bought', 'buying'],
          correctAnswer: 'bought',
          explanation: 'The past tense form of irregular verb "buy" is "bought".',
          explanationVi: 'Dạng quá khứ bất quy tắc của động từ "buy" là "bought".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the auxiliary verb.',
          question: '_____ you watch the football match last night?',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'Did',
          explanation: 'Use auxiliary verb "Did" for past simple questions.',
          explanationVi: 'Dùng trợ động từ "Did" ở đầu câu hỏi quá khứ đơn.',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the double past tense error.',
          question: 'We didn\'t went to the cinema yesterday evening.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'went', correction: 'go' },
          correctAnswer: 'go',
          explanation: 'After negative auxiliary "didn\'t", the main verb returns to base form "go".',
          explanationVi: 'Sau trợ động từ phủ định "didn\'t", động từ chính ở dạng nguyên thể "go".',
          order: 3,
        },
      ],
    },
    {
      slug: 'past-continuous-tense',
      title: 'Past Continuous Tense',
      titleVi: 'Thì Quá Khứ Tiếp Diễn',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Ongoing actions in the past interrupted by another event or parallel past actions.',
      level: EnglishLevel.ELEMENTARY,
      order: 4,
      content: `
# Thì Quá Khứ Tiếp Diễn (Past Continuous Tense)

## 1. Công Dụng
- Hành động đang diễn ra tại một thời điểm xác định trong quá khứ (*At 8 PM yesterday, I was studying*).
- Hành động đang xảy ra thì có hành động khác xen vào (When / While).
- Hai hành động xảy ra song song: *While mom was cooking, dad was washing dishes.*

## 2. Công Thức
- **(+)**: S + was/were + V-ing
- **(-)**: S + was/were not + V-ing
      `,
      exercises: [
        {
          instruction: 'Choose the correct combination.',
          question: 'While I _____ home, it started to rain heavily.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['walked', 'was walking', 'am walking', 'were walking'],
          correctAnswer: 'was walking',
          explanation: 'An ongoing action interrupted in the past uses was/were + V-ing.',
          explanationVi: 'Hành động đang diễn ra trong quá khứ dùng was/were + V-ing: "was walking".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank.',
          question: 'At 10 PM last night, they _____ (watch) a movie together.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'were watching',
          explanation: 'Subject "they" takes "were watching".',
          explanationVi: 'Chủ ngữ "they" đi với "were watching".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Correct the subject-verb agreement.',
          question: 'The boys was playing soccer when the storm hit the town.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'was playing', correction: 'were playing' },
          correctAnswer: 'were playing',
          explanation: 'Plural subject "The boys" requires "were playing".',
          explanationVi: 'Chủ ngữ số nhiều "The boys" đi với "were playing".',
          order: 3,
        },
      ],
    },
    {
      slug: 'present-perfect-tense',
      title: 'Present Perfect Tense',
      titleVi: 'Thì Hiện Tại Hoàn Thành',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Connecting past experiences and ongoing actions with the present moment.',
      level: EnglishLevel.ELEMENTARY,
      order: 5,
      content: `
# Thì Hiện Tại Hoàn Thành (Present Perfect Tense)

## 1. Công Dụng
- Hành động xảy ra trong quá khứ nhưng kết quả hoặc liên hệ vẫn còn ở hiện tại.
- Hành động bắt đầu trong quá khứ và vẫn tiếp diễn đến nay (*since, for*).
- Trải nghiệm cuộc sống (*ever, never*).

## 2. Công Thức
- **(+)**: S + have/has + V3/ed
- **(-)**: S + have/has not + V3/ed
      `,
      exercises: [
        {
          instruction: 'Select the correct option.',
          question: 'Minh _____ in this tech company since 2021.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['works', 'worked', 'has worked', 'is working'],
          correctAnswer: 'has worked',
          explanation: '"Since 2021" indicates an action starting in the past continuing until now, requiring Present Perfect.',
          explanationVi: '"Since 2021" yêu cầu thì hiện tại hoàn thành "has worked".',
          order: 1,
        },
        {
          instruction: 'Fill in the preposition.',
          question: 'I have known him _____ three years.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'for',
          explanation: 'Use "for" with a duration or period of time.',
          explanationVi: 'Dùng "for" trước một khoảng thời gian (three years).',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the past time marker with present perfect.',
          question: 'I have visited Da Nang city yesterday afternoon.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'have visited', correction: 'visited' },
          correctAnswer: 'visited',
          explanation: 'Specific past time markers like "yesterday" require Past Simple "visited", not Present Perfect.',
          explanationVi: 'Mốc thời gian quá khứ xác định "yesterday" bắt buộc dùng quá khứ đơn "visited".',
          order: 3,
        },
      ],
    },
    {
      slug: 'future-simple-will-going-to',
      title: 'Future Simple: Will vs Be Going To',
      titleVi: 'Tương Lai Đơn: Will và Be Going To',
      category: 'Tenses',
      categoryVi: 'Các Thì Trong Tiếng Anh',
      summary: 'Differentiating spontaneous decisions from pre-arranged plans and predictions.',
      level: EnglishLevel.ELEMENTARY,
      order: 6,
      content: `
# Tương Lai: Will vs Be Going To

## 1. Will + V(nguyên mẫu)
- Quyết định nảy sinh tức thì tại thời điểm nói: *The phone is ringing. I will answer it.*
- Lời hứa, lời đề nghị: *I will help you.*

## 2. Be Going To + V(nguyên mẫu)
- Kế hoạch, dự định đã có từ trước: *I am going to visit Hanoi this weekend.*
- Dự đoán có bằng chứng cụ thể: *Look at those black clouds! It is going to rain.*
      `,
      exercises: [
        {
          instruction: 'Choose between will and be going to.',
          question: 'Look at the sky! It _____ rain very soon.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['will', 'is going to', 'shall', 'was going to'],
          correctAnswer: 'is going to',
          explanation: 'The dark sky is clear evidence, so use "is going to".',
          explanationVi: 'Có bằng chứng cụ thể trước mắt nên dùng "is going to".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the modal verb for spontaneous decision.',
          question: 'Don\'t carry that heavy box alone. I _____ carry it for you.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'will',
          explanation: 'A spontaneous offer to help uses "will".',
          explanationVi: 'Quyết định giúp đỡ nảy sinh tức thì dùng "will".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the prediction based on evidence.',
          question: 'Look at that reckless driver! He will crash into the fence.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'will crash', correction: 'is going to crash' },
          correctAnswer: 'is going to crash',
          explanation: 'Predictions with direct immediate evidence use "is going to crash".',
          explanationVi: 'Dự đoán có bằng chứng trước mắt dùng "is going to crash".',
          order: 3,
        },
      ],
    },

    // 2. MODAL VERBS (1 lesson)
    {
      slug: 'modal-verbs',
      title: 'Modal Verbs: Can, Could, Must, Should',
      titleVi: 'Động Từ Khuyết Thiếu (Modal Verbs)',
      category: 'Modal Verbs',
      categoryVi: 'Động Từ Khuyết Thiếu',
      summary: 'Ability, permission, obligations, prohibitions, and recommendations.',
      level: EnglishLevel.INTERMEDIATE,
      order: 7,
      content: `
# Động Từ Khuyết Thiếu (Modal Verbs)

## 1. Can / Could
- Khả năng (ability): *She can speak English fluently.*
- Lời yêu cầu lịch sự: *Could you please open the window?*

## 2. Must vs Have to
- Bắt buộc nghiêm ngặt: *You must wear a helmet on a motorbike.*
- Phủ định *Must not* = Cấm đoán.

## 3. Should
- Lời khuyên, khuyến nghị: *You should exercise every morning.*
      `,
      exercises: [
        {
          instruction: 'Choose the best modal verb.',
          question: 'You _____ wear a helmet when riding a motorbike by law.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['might', 'should', 'must', 'could'],
          correctAnswer: 'must',
          explanation: 'Law requirement implies strict obligation: "must".',
          explanationVi: 'Quy định luật pháp bắt buộc dùng "must".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the modal verb for advice.',
          question: 'You look very tired; you _____ take a short rest.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'should',
          explanation: 'Use "should" to give healthy advice.',
          explanationVi: 'Dùng "should" để đưa ra lời khuyên.',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the modal verb follower.',
          question: 'She should to consult a doctor immediately.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'should to consult', correction: 'should consult' },
          correctAnswer: 'consult',
          explanation: 'Modal verbs like "should" take bare infinitive without "to".',
          explanationVi: 'Động từ khuyết thiếu "should" đi với động từ nguyên mẫu không "to".',
          order: 3,
        },
      ],
    },

    // 3. ARTICLES (1 lesson)
    {
      slug: 'articles-a-an-the',
      title: 'Articles: A, An, The & Zero Article',
      titleVi: 'Mạo Từ: A, An, The và Zero Article',
      category: 'Articles',
      categoryVi: 'Mạo Từ (A, An, The)',
      summary: 'Rules for indefinite, definite, and zero articles with countability distinctions.',
      level: EnglishLevel.BEGINNER,
      order: 8,
      content: `
# Mạo Từ: A, An, The & Zero Article

## 1. Mạo Từ Bất Định (A / An)
- **A**: Trước từ phát âm bắt đầu bằng phụ âm (*a book, a university*).
- **An**: Trước từ phát âm bắt đầu bằng nguyên âm (*an apple, an hour*).

## 2. Mạo Từ Xác Định (The)
- Đứng trước danh từ đã được xác định hoặc duy nhất (*the sun, the world*).
- Trước nhạc cụ: *play the violin*. Trước so sánh nhất: *the tallest building*.

## 3. Không Dùng Mạo Từ (Zero Article - Ø)
- Trước danh từ số nhiều / không đếm được nói chung (*I like coffee*).
- Bữa ăn: *have lunch*. Môn học, thể thao: *study math, play tennis*.
      `,
      exercises: [
        {
          instruction: 'Choose the correct article for the sentence.',
          question: 'It took us more than _____ hour to finish our homework.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['a', 'an', 'the', 'no article'],
          correctAnswer: 'an',
          explanation: '"Hour" begins with a silent "h", so its initial vowel sound requires "an".',
          explanationVi: '"Hour" có âm "h" câm nên bắt đầu bằng nguyên âm /aʊər/, dùng "an".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the appropriate article (a, an, or the).',
          question: 'Look at _____ moon tonight! It is full and shining brightly.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'the',
          explanation: 'The moon is unique in our celestial environment, requiring "the".',
          explanationVi: 'Mặt trăng là vật thể duy nhất nên đi với "the".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the article error in the sentence.',
          question: 'She is studying at an university in London.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'an university', correction: 'a university' },
          correctAnswer: 'a',
          explanation: '"University" begins with consonant sound /j/, so use "a university".',
          explanationVi: '"University" phát âm bắt đầu bằng phụ âm /j/, dùng "a university".',
          order: 3,
        },
      ],
    },

    // 4. PREPOSITIONS (1 lesson)
    {
      slug: 'prepositions-time-place-in-on-at',
      title: 'Prepositions of Time & Place: In, On, At',
      titleVi: 'Giới Từ Thời Gian & Nơi Chốn: In, On, At',
      category: 'Prepositions',
      categoryVi: 'Giới Từ Chỉ Thời Gian & Nơi Chốn',
      summary: 'Distinguish broad, surface, and exact points of time and physical locations.',
      level: EnglishLevel.ELEMENTARY,
      order: 9,
      content: `
# Giới Từ Thời Gian & Nơi Chốn: In, On, At

## 1. Thời Gian
- **In**: Năm, mùa, tháng, thế kỷ (*in 2026, in summer, in July, in the morning*).
- **On**: Ngày trong tuần, ngày tháng cụ thể (*on Monday, on October 10th*).
- **At**: Giờ cụ thể, thời điểm ngắn (*at 7:00 AM, at noon, at midnight*).

## 2. Nơi Chốn
- **In**: Không gian 3D, thành phố, quốc gia (*in Hanoi, in Vietnam, in the room*).
- **On**: Bề mặt, đường phố, tầng nhà (*on the table, on Tran Phu Street, on the 2nd floor*).
- **At**: Địa chỉ cụ thể, điểm dừng (*at 123 Main Street, at the bus stop*).
      `,
      exercises: [
        {
          instruction: 'Select the correct preposition of time.',
          question: 'Our flight departs _____ 7:15 AM tomorrow morning.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['in', 'on', 'at', 'by'],
          correctAnswer: 'at',
          explanation: 'Exact clock times take "at".',
          explanationVi: 'Giờ giấc chính xác đi với "at".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the correct preposition.',
          question: 'We always hold team sync meetings _____ Monday afternoons.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'on',
          explanation: 'Days of the week take "on".',
          explanationVi: 'Các ngày trong tuần đi cùng "on".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the preposition error.',
          question: 'She was born at October in a small peaceful town.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'at October', correction: 'in October' },
          correctAnswer: 'in',
          explanation: 'Months alone take preposition "in".',
          explanationVi: 'Tên tháng đứng một mình đi với giới từ "in".',
          order: 3,
        },
      ],
    },

    // 5. CONDITIONALS (1 lesson)
    {
      slug: 'conditionals-type-1-2',
      title: 'Conditionals: Type 1 & Type 2',
      titleVi: 'Câu Điều Kiện: Loại 1 và Loại 2',
      category: 'Conditionals',
      categoryVi: 'Câu Điều Kiện',
      summary: 'Hypothetical situations versus real and probable future conditions.',
      level: EnglishLevel.INTERMEDIATE,
      order: 10,
      content: `
# Câu Điều Kiện Loại 1 & Loại 2

## 1. Loại 1 (Có thật ở hiện tại / tương lai)
- **Cấu trúc**: If + S + V(hiện tại đơn), S + will + V(nguyên mẫu)
- *Ví dụ*: If it rains, we will stay home.

## 2. Loại 2 (Giả định trái ngược thực tế ở hiện tại)
- **Cấu trúc**: If + S + V2/ed (were cho mọi ngôi), S + would + V(nguyên mẫu)
- *Ví dụ*: If I were you, I would take that offer.
      `,
      exercises: [
        {
          instruction: 'Select the correct verb form for Type 1 conditional.',
          question: 'If you study consistently, you _____ the exam with high scores.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['pass', 'will pass', 'would pass', 'passed'],
          correctAnswer: 'will pass',
          explanation: 'First conditional main clause uses "will + base verb".',
          explanationVi: 'Mệnh đề chính câu điều kiện loại 1 dùng "will + V".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the hypothetical past subjunctive of "be".',
          question: 'If I _____ you, I would take that scholarship opportunity.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'were',
          explanation: 'In second conditional, "were" is conventionally used for all subjects.',
          explanationVi: 'Trong câu điều kiện loại 2, dùng "were" cho tất cả các ngôi.',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the modal in first conditional if-clause.',
          question: 'If it will rain tomorrow, we will postpone the outdoor match.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'will rain', correction: 'rains' },
          correctAnswer: 'rains',
          explanation: 'In conditional type 1, the IF clause uses Present Simple "rains", not "will rain".',
          explanationVi: 'Mệnh đề if loại 1 dùng thì hiện tại đơn "rains", không dùng "will rain".',
          order: 3,
        },
      ],
    },

    // 6. PASSIVE VOICE (1 lesson)
    {
      slug: 'passive-voice',
      title: 'Passive Voice Across Tenses',
      titleVi: 'Câu Bị Động Các Thì',
      category: 'Passive Voice',
      categoryVi: 'Câu Bị Động',
      summary: 'Transforming active sentences into passive voice to emphasize the recipient of action.',
      level: EnglishLevel.UPPER_INTERMEDIATE,
      order: 11,
      content: `
# Câu Bị Động (Passive Voice)

## 1. Nguyên Tắc Biến Đổi
- Cấu trúc chung: **Be + V3/ed** (động từ "Be" chia theo thì của câu chủ động).
- Tân ngữ câu chủ động trở thành chủ ngữ câu bị động.

## 2. Công Thức Theo Thì
- Hiện tại đơn: am/is/are + V3/ed
- Quá khứ đơn: was/were + V3/ed
- Hiện tại hoàn thành: have/has been + V3/ed
      `,
      exercises: [
        {
          instruction: 'Choose the correct passive verb phrase.',
          question: 'The famous bridge _____ by skilled engineers in 1902.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['built', 'was built', 'is built', 'has been built'],
          correctAnswer: 'was built',
          explanation: 'In 1902 denotes a past event in passive voice: "was built".',
          explanationVi: 'Năm 1902 trong quá khứ ở thể bị động dùng "was built".',
          order: 1,
        },
        {
          instruction: 'Fill in the past participle.',
          question: 'English is _____ (speak) as an official language in many countries.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'spoken',
          explanation: 'The past participle (V3) of "speak" is "spoken".',
          explanationVi: 'Phân từ hai của "speak" là "spoken".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the passive auxiliary.',
          question: 'The report was wrote by our senior financial analyst.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'wrote', correction: 'written' },
          correctAnswer: 'written',
          explanation: 'Passive voice requires past participle V3 "written", not simple past V2 "wrote".',
          explanationVi: 'Câu bị động cần phân từ hai V3 "written", không dùng V2 "wrote".',
          order: 3,
        },
      ],
    },

    // 7. REPORTED SPEECH (1 lesson)
    {
      slug: 'reported-speech',
      title: 'Reported Speech: Statements & Questions',
      titleVi: 'Câu Trực Tiếp & Gián Tiếp (Reported Speech)',
      category: 'Reported Speech',
      categoryVi: 'Câu Trực Tiếp & Gián Tiếp',
      summary: 'Rules for backshifting tenses, adjusting pronouns, and changing time markers.',
      level: EnglishLevel.INTERMEDIATE,
      order: 12,
      content: `
# Câu Trực Tiếp & Gián Tiếp (Reported Speech)

## 1. Nguyên Tắc Lùi Thì (Backshift)
Khi động từ dẫn ở quá khứ (*said, told*), lùi một thì:
- Present Simple -> Past Simple (*"I work" -> He said he worked*)
- Present Continuous -> Past Continuous (*"I am studying" -> She said she was studying*)
- Will -> Would, Can -> Could, May -> Might, Must -> Had to

## 2. Trạng Từ Chỉ Thời Gian & Nơi Chốn
- *now -> then, today -> that day, tomorrow -> the following day, yesterday -> the day before*.
      `,
      exercises: [
        {
          instruction: 'Choose the correct indirect reported statement.',
          question: '"I am working on my thesis today," Linh said. -> Linh said she _____ on her thesis that day.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['is working', 'was working', 'has worked', 'had been worked'],
          correctAnswer: 'was working',
          explanation: 'Present continuous ("am working") backshifts to past continuous ("was working").',
          explanationVi: 'Hiện tại tiếp diễn lùi thì thành quá khứ tiếp diễn "was working".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the backshifted auxiliary.',
          question: 'He promised he _____ send the contract by Friday afternoon.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'would',
          explanation: '"Will" backshifts to "would" in indirect speech.',
          explanationVi: '"Will" lùi thì thành "would".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the backshifting mistake.',
          question: 'Minh said that he can speak German very fluently.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'can speak', correction: 'could speak' },
          correctAnswer: 'could',
          explanation: 'With past reporting verb "said", "can" must backshift to "could".',
          explanationVi: 'Động từ dẫn "said" yêu cầu lùi thì "can" thành "could".',
          order: 3,
        },
      ],
    },

    // 8. BASIC GRAMMAR (2 lessons)
    {
      slug: 'comparatives-and-superlatives',
      title: 'Comparatives & Superlatives',
      titleVi: 'So Sánh Hơn và So Sánh Nhất',
      category: 'Basic Grammar',
      categoryVi: 'Ngữ Pháp Căn Bản',
      summary: 'Forming comparisons for short and long adjectives and irregular forms.',
      level: EnglishLevel.INTERMEDIATE,
      order: 13,
      content: `
# So Sánh Hơn & So Sánh Nhất (Comparatives & Superlatives)

## 1. So Sánh Hơn
- Tính từ ngắn: adj + -er + than (*faster than*)
- Tính từ dài: more + adj + than (*more comfortable than*)

## 2. So Sánh Nhất
- Tính từ ngắn: the + adj + -est (*the tallest*)
- Tính từ dài: the most + adj (*the most exciting*)

## 3. Bất Quy Tắc
- good -> better -> the best
- bad -> worse -> the worst
      `,
      exercises: [
        {
          instruction: 'Choose the correct comparative form.',
          question: 'Traveling by bullet train is _____ than traveling by standard coach.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['fast', 'faster', 'more fast', 'fastest'],
          correctAnswer: 'faster',
          explanation: '"Fast" is a one-syllable adjective, so add "-er".',
          explanationVi: '"Fast" là tính từ ngắn 1 âm tiết, dạng so sánh hơn là "faster".',
          order: 1,
        },
        {
          instruction: 'Fill in the blank with the superlative form of "good".',
          question: 'This is the _____ bowl of Pho I have ever tasted in Hanoi.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'best',
          explanation: 'The superlative form of irregular adjective "good" is "best".',
          explanationVi: 'Dạng so sánh nhất bất quy tắc của "good" là "best".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the double comparative error.',
          question: 'This smartphone is more cheaper than the other brand.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'more cheaper', correction: 'cheaper' },
          correctAnswer: 'cheaper',
          explanation: '"Cheap" is a short adjective; use "cheaper", never "more cheaper".',
          explanationVi: '"Cheap" là tính từ ngắn, so sánh hơn là "cheaper", không dùng "more cheaper".',
          order: 3,
        },
      ],
    },
    {
      slug: 'relative-clauses',
      title: 'Relative Clauses: Who, Which, That, Whose',
      titleVi: 'Mệnh Đề Quan Hệ',
      category: 'Basic Grammar',
      categoryVi: 'Ngữ Pháp Căn Bản',
      summary: 'Connecting ideas seamlessly using relative pronouns and defining vs non-defining clauses.',
      level: EnglishLevel.UPPER_INTERMEDIATE,
      order: 14,
      content: `
# Mệnh Đề Quan Hệ (Relative Clauses)

## 1. Đại Từ Quan Hệ
- **Who**: Thay thế cho danh từ chỉ người làm chủ ngữ.
- **Whom**: Thay thế cho danh từ chỉ người làm tân ngữ.
- **Which**: Thay thế cho danh từ chỉ đồ vật, sự việc.
- **That**: Thay thế cho cả người lẫn vật trong mệnh đề xác định.
- **Whose**: Chỉ quan hệ sở hữu.
      `,
      exercises: [
        {
          instruction: 'Select the appropriate relative pronoun.',
          question: 'The teacher _____ inspired me to pursue linguistics is retiring this month.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: ['which', 'who', 'whose', 'where'],
          correctAnswer: 'who',
          explanation: '"The teacher" is a person acting as the subject of the clause, so use "who".',
          explanationVi: '"The teacher" là danh từ chỉ người làm chủ ngữ trong mệnh đề quan hệ, do đó dùng "who".',
          order: 1,
        },
        {
          instruction: 'Fill in the relative pronoun showing possession.',
          question: 'I met a student _____ pronunciation was remarkably clear.',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'whose',
          explanation: 'Possessive relationship ("student\'s pronunciation") requires "whose".',
          explanationVi: 'Quan hệ sở hữu (phát âm của bạn học sinh) đòi hỏi dùng đại từ sở hữu "whose".',
          order: 2,
        },
        {
          instruction: 'Sentence correction: Fix the relative pronoun error.',
          question: 'The laptop who I bought last week has outstanding battery life.',
          questionType: QuestionType.SENTENCE_CORRECTION,
          options: { error: 'who', correction: 'which' },
          correctAnswer: 'which',
          explanation: '"Laptop" is a thing, so use relative pronoun "which" or "that", not "who".',
          explanationVi: '"Laptop" là đồ vật, đại từ quan hệ thay thế phải là "which" hoặc "that", không dùng "who".',
          order: 3,
        },
      ],
    },
  ];

  const createdGrammarLessons = new Map<string, string>();
  for (const lessonData of grammarLessonsData) {
    const { exercises, ...lessonFields } = lessonData;
    const lesson = await prisma.grammarLesson.create({ data: lessonFields });
    createdGrammarLessons.set(lesson.slug, lesson.id);
    for (const ex of exercises) {
      await prisma.grammarExercise.create({
        data: {
          ...ex,
          options: ex.options ?? Prisma.DbNull,
          lessonId: lesson.id,
        },
      });
    }
  }

  // 6. Seed Listening Lessons (5+ lessons)
  // ==============================================
  console.log('Seeding listening lessons...');
  const listeningLessonsData = [
    {
      slug: 'ordering-coffee-in-london',
      title: 'Ordering Coffee at a Busy Cafe',
      titleVi: 'Gọi cà phê tại quán nước London',
      description: 'Listen to a natural conversation between a customer and a barista placing a custom order.',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      duration: 145,
      level: EnglishLevel.BEGINNER,
      transcript: `
Barista: Good morning! Welcome to Central Roast. What can I get started for you today?
Customer: Hi there! Could I please get a large oat milk latte?
Barista: Absolutely. Would you like that hot or iced?
Customer: Hot, please. And could you make it extra hot with one pump of vanilla syrup?
Barista: Sure thing! Extra hot oat latte with vanilla. Any pastries or snacks with that?
Customer: Yes, I'll also take one warm almond croissant, please.
Barista: Perfect. That comes to £6.80. Are you paying with contactless card or cash?
Customer: Contactless card, please. Here you go.
Barista: Thank you! You can pick up your drink at the counter on the left in about two minutes.
      `,
      transcriptVi: `
Nhân viên: Chào buổi sáng! Chào mừng quý khách đến Central Roast. Tôi có thể lấy gì cho quý khách hôm nay ạ?
Khách hàng: Xin chào! Cho tôi một ly latte sữa yến mạch cỡ lớn được không?
Nhân viên: Chắc chắn rồi ạ. Quý khách muốn dùng nóng hay đá ạ?
Khách hàng: Nóng nhé. Và làm ơn cho nóng thêm một chút kèm một shot siro vani nhé.
Nhân viên: Dạ được ạ! Latte yến mạch thêm nóng và siro vani. Quý khách có muốn dùng thêm bánh ngọt gì không ạ?
Khách hàng: Có, cho tôi thêm một chiếc bánh sừng bò hạnh nhân hâm nóng nhé.
Nhân viên: Tuyệt vời. Của quý khách hết 6.80 bảng. Quý khách thanh toán thẻ chạm hay tiền mặt ạ?
Khách hàng: Thẻ chạm nhé. Của bạn đây.
Nhân viên: Cảm ơn quý khách! Quý khách có thể nhận đồ uống tại quầy bên trái sau khoảng 2 phút nhé.
      `,
    },
    {
      slug: 'asking-for-directions',
      title: 'Asking for Directions in the City',
      titleVi: 'Hỏi đường trong thành phố',
      description: 'Learn how to politely ask passersby for directions to the nearest metro station.',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_city_traffic.ogg',
      duration: 120,
      level: EnglishLevel.ELEMENTARY,
      transcript: `
Tourist: Excuse me, sir? Sorry to bother you, but do you know where the nearest underground station is?
Local: No problem at all! You are about five minutes away from King's Cross. Just walk straight down this avenue until you see a tall brick clock tower.
Tourist: Okay, straight down this avenue to the clock tower. And then?
Local: Once you reach the pedestrian crossing, turn right onto Market Street. The station entrance is right next to the public library. You can't miss it.
Tourist: Turn right on Market Street next to the library. That sounds straightforward. Thank you so much!
Local: You're very welcome! Have a pleasant day.
      `,
      transcriptVi: `
Khách du lịch: Xin lỗi anh? Làm phiền anh chút, anh có biết ga tàu điện ngầm gần nhất ở đâu không ạ?
Người dân: Không sao đâu bạn! Bạn chỉ cách ga King's Cross khoảng 5 phút đi bộ thôi. Cứ đi thẳng theo đại lộ này cho đến khi bạn thấy tháp đồng hồ bằng gạch cao.
Khách du lịch: Vâng, đi thẳng đại lộ tới tháp đồng hồ. Rồi sao nữa ạ?
Người dân: Khi đến lối sang đường cho người đi bộ, rẽ phải vào đường Market Street. Lối vào ga nằm ngay cạnh thư viện công cộng. Bạn không thể đi lạc được đâu.
Khách du lịch: Rẽ phải vào Market Street cạnh thư viện. Nghe rất dễ tìm. Cảm ơn anh nhiều lắm!
Người dân: Không có chi! Chúc bạn một ngày tốt lành nhé.
      `,
    },
    {
      slug: 'job-interview-introduction',
      title: 'Job Interview: Tell Me About Yourself',
      titleVi: 'Phỏng vấn xin việc: Giới thiệu bản thân',
      description: 'Listen to a software engineer candidate introducing herself effectively during an interview.',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room.ogg',
      duration: 180,
      level: EnglishLevel.INTERMEDIATE,
      transcript: `
Interviewer: Welcome, Linh. To begin our conversation today, could you please walk us through your professional background?
Candidate: Certainly! Thank you for this opportunity. I am a full-stack software developer with over three years of experience building modern web applications. In my previous role at a fintech company in Ho Chi Minh City, I led the migration of our legacy frontend to a responsive React architecture, which improved page loading speeds by 40%. I thrive on solving real-world challenges through clean code and collaborative teamwork. I'm especially eager about this position because your company is pioneering cutting-edge educational platforms for international learners.
Interviewer: That is very impressive, Linh. We will delve deeper into your architectural decisions shortly.
      `,
      transcriptVi: `
Người phỏng vấn: Chào mừng Linh. Để bắt đầu buổi trò chuyện hôm nay, bạn có thể tóm tắt sơ lược về quá trình làm việc của mình được không?
Ứng viên: Chắc chắn rồi ạ! Cảm ơn anh/chị vì cơ hội này. Tôi là một lập trình viên full-stack với hơn ba năm kinh nghiệm xây dựng ứng dụng web hiện đại. Tại vị trí trước đây ở một công ty công nghệ tài chính tại TP.HCM, tôi đã dẫn dắt việc chuyển đổi hệ thống giao diện cũ sang kiến trúc React, giúp tăng tốc độ tải trang lên 40%. Tôi rất đam mê giải quyết các thách thức thực tế bằng mã nguồn tối ưu và tinh thần làm việc nhóm. Tôi rất hào hứng với vị trí này vì quý công ty đang tiên phong phát triển các nền tảng giáo dục hiện đại cho người học quốc tế.
Người phỏng vấn: Rất ấn tượng, Linh. Chúng ta sẽ cùng thảo luận sâu hơn về các quyết định kỹ thuật của bạn ngay sau đây.
      `,
    },
    {
      slug: 'hotel-check-in',
      title: 'Checking into an International Hotel',
      titleVi: 'Làm thủ tục nhận phòng khách sạn',
      description: 'A smooth conversation covering booking confirmation, breakfast hours, and room keys.',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/hotel_lobby.ogg',
      duration: 155,
      level: EnglishLevel.ELEMENTARY,
      transcript: `
Receptionist: Good evening and welcome to the Grand Waterfront Hotel. How may I assist you tonight?
Guest: Hello, I have a reservation under the name of Nguyen for three nights.
Receptionist: Let me check that for you... Yes, Mr. Nguyen! A deluxe king room with ocean view, arriving today and checking out on Thursday. May I please have your passport for registration?
Guest: Here it is. Also, is complimentary breakfast included in our stay?
Receptionist: Yes, indeed! Breakfast buffet is served daily on the second floor from 6:30 AM to 10:00 AM. Here are your keycards for room 704. The elevators are right around the corner.
Guest: Wonderful, thank you for your warm hospitality.
      `,
      transcriptVi: `
Lễ tân: Kính chào quý khách và chào mừng quý khách đến Khách sạn Grand Waterfront. Em có thể hỗ trợ gì cho quý khách tối nay ạ?
Khách: Xin chào, tôi có đặt phòng trước dưới tên Nguyễn cho 3 đêm.
Lễ tân: Để em kiểm tra hệ thống ạ... Dạ đúng rồi anh Nguyễn! Một phòng Deluxe giường đôi hướng biển, nhận phòng hôm nay và trả phòng vào thứ Năm. Cho em xin hộ chiếu để làm thủ tục nhé?
Khách: Của em đây. Nhân tiện cho anh hỏi bữa sáng miễn phí có bao gồm trong gói phòng không em?
Lễ tân: Dạ có chứ ạ! Tiệc buffet sáng phục vụ hàng ngày tại tầng 2 từ 6:30 đến 10:00 sáng. Đây là thẻ từ phòng 704 của anh. Thang máy nằm ngay góc rẽ kia ạ.
Khách: Tuyệt quá, cảm ơn sự tiếp đón chu đáo của em nhé.
      `,
    },
    {
      slug: 'discussing-weekend-plans',
      title: 'Discussing Weekend Plans with Friends',
      titleVi: 'Bàn kế hoạch đi chơi cuối tuần với bạn bè',
      description: 'Informal, friendly dialogue discussing camping, weather, and packing essentials.',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/park_birds.ogg',
      duration: 135,
      level: EnglishLevel.BEGINNER,
      transcript: `
Alex: Hey Mai! Do you have any special plans for this Saturday?
Mai: Not yet, Alex. I was thinking of just staying home and catching up on my favorite book. Why do you ask?
Alex: A few of us are organizing a camping trip near Ba Vi National Park! The weather forecast predicts clear blue skies and cool breezes. Would you like to come along?
Mai: That sounds fantastic! I haven't been out in nature for weeks. What should I bring?
Alex: Just bring a warm jacket, good hiking shoes, and your camera. We'll handle the tents and barbecue food together.
Mai: Count me in! I'll see you Saturday morning.
      `,
      transcriptVi: `
Alex: Chào Mai! Thứ Bảy này bạn có kế hoạch đặc biệt gì chưa?
Mai: Chưa Alex ơi. Mình đang tính ở nhà nghỉ ngơi và đọc nốt cuốn sách yêu thích thôi. Sao bạn lại hỏi thế?
Alex: Mấy đứa mình đang rủ nhau đi cắm trại ở Vườn quốc gia Ba Vì đấy! Dự báo thời tiết nói trời trong xanh mát mẻ lắm. Bạn có muốn đi cùng không?
Mai: Nghe hay quá! Lâu lắm rồi mình chưa được hòa mình vào thiên nhiên. Mình cần chuẩn bị những gì nhỉ?
Alex: Chỉ cần mang áo khoác ấm, giày leo núi tốt và máy ảnh thôi. Lều bạt và đồ nướng BBQ tụi mình sẽ chuẩn bị chung.
Mai: Nhất trí luôn! Hẹn gặp lại bạn sáng thứ Bảy nhé.
      `,
    },
  ];

  const createdListeningLessons = new Map<string, string>();
  for (const item of listeningLessonsData) {
    const record = await prisma.listeningLesson.create({ data: item });
    createdListeningLessons.set(record.slug, record.id);
  }

  // ==============================================
  // 7. Seed Reading Articles (5+ articles)
  // ==============================================
  console.log('Seeding reading articles...');
  const readingArticlesData = [
    {
      slug: 'benefits-of-bilingualism',
      title: 'The Cognitive Benefits of Learning a Second Language',
      titleVi: 'Lợi ích nhận thức khi học ngôn ngữ thứ hai',
      summary: 'Exploring how mastering an additional language boosts memory, creativity, and neuroplasticity.',
      readingTime: 6,
      level: EnglishLevel.INTERMEDIATE,
      content: `
# The Cognitive Benefits of Learning a Second Language

In an increasingly interconnected global economy, the ability to communicate in more than one language is universally prized. Beyond career prospects and cross-cultural friendships, cognitive scientists have uncovered compelling evidence that learning a second language rewires the brain in profoundly positive ways.

### Enhanced Executive Function
Executive function refers to the suite of cognitive skills that enable humans to plan, focus attention, switch tasks, and juggle multiple priorities simultaneously. Bilingual individuals constantly exercise these mental muscles because their brains are continuously selecting between two distinct linguistic systems while inhibiting irrelevant words. Studies show that this mental flexibility translates to faster decision-making and better problem-solving abilities in non-verbal contexts.

### Delaying Cognitive Decline
Perhaps the most extraordinary finding from neuroscience is the protective effect bilingualism confers against neurodegenerative conditions. Epidemiological studies conducted in Canada and India revealed that individuals who spoke two or more languages developed symptoms of Alzheimer's disease on average 4 to 5 years later than monolingual peers, despite having identical degrees of brain pathology. The intellectual rigor of switching between grammars creates a substantial "cognitive reserve."

### Heightened Empathy and Cultural Perspective
Acquiring a new language is never simply about memorizing grammar rules and vocabulary lists; it requires adopting different cultural frameworks. Vietnamese learners practicing English often discover distinct modes of humor, politeness conventions, and directness. This linguistic immersion fosters greater empathy, enabling learners to appreciate multiple viewpoints without judgment.
      `,
      contentVi: `
# Lợi ích nhận thức khi học ngôn ngữ thứ hai

Trong một nền kinh tế toàn cầu ngày càng kết nối chặt chẽ, khả năng giao tiếp bằng nhiều ngôn ngữ được đánh giá rất cao. Bên cạnh triển vọng nghề nghiệp và tình bạn xuyên biên giới, các nhà khoa học nhận thức đã phát hiện ra những bằng chứng thuyết phục cho thấy việc học ngôn ngữ thứ hai giúp tái cấu trúc bộ não theo hướng tích cực sâu sắc.

### Nâng cao chức năng điều hành
Chức năng điều hành bao gồm tập hợp các kỹ năng nhận thức cho phép con người lập kế hoạch, tập trung chú ý, chuyển đổi nhiệm vụ và xử lý nhiều mục tiêu cùng lúc. Những người song ngữ liên tục rèn luyện các "cơ bắp tinh thần" này vì não bộ của họ phải liên tục lựa chọn giữa hai hệ thống ngôn ngữ khác nhau đồng thời ngăn chặn các từ ngữ không phù hợp. Các nghiên cứu chỉ ra rằng sự linh hoạt này mang lại khả năng ra quyết định nhanh hơn và giải quyết vấn đề tốt hơn.

### Làm chậm quá trình suy giảm nhận thức
Có lẽ phát hiện phi thường nhất từ khoa học thần kinh là tác dụng bảo vệ mà việc biết hai thứ tiếng mang lại trước các bệnh thoái hóa thần kinh. Các nghiên cứu dịch tễ học tại Canada và Ấn Độ cho thấy những người nói từ hai thứ tiếng trở lên xuất hiện các triệu chứng của bệnh Alzheimer muộn hơn trung bình 4 đến 5 năm so với người chỉ nói một thứ tiếng.

### Nâng cao sự thấu cảm và góc nhìn văn hóa
Học một ngôn ngữ mới không đơn thuần là học thuộc lòng ngữ pháp và từ vựng; nó đòi hỏi sự tiếp nhận các hệ quy chiếu văn hóa khác nhau. Người học Việt Nam khi luyện tập tiếng Anh thường khám phá ra những nét hài hước độc đáo, quy chuẩn lịch sự và cách diễn đạt trực diện, từ đó bồi đắp lòng thấu cảm và khả năng tôn trọng đa góc nhìn.
      `,
    },
    {
      slug: 'vietnam-coffee-culture',
      title: 'The Story Behind Vietnam’s Iconic Coffee Culture',
      titleVi: 'Câu chuyện đằng sau văn hóa cà phê độc đáo của Việt Nam',
      summary: 'From robusta plantations in the Central Highlands to bustling sidewalk cafes in Hanoi and Saigon.',
      readingTime: 5,
      level: EnglishLevel.BEGINNER,
      content: `
# The Story Behind Vietnam’s Iconic Coffee Culture

Coffee in Vietnam is not just an energetic morning beverage; it is a leisurely lifestyle, a communal ritual, and a proud cultural identity. Today, Vietnam stands proudly as the world's second-largest exporter of coffee and the undisputed leader in robusta production.

### The Traditional Phin Filter
Unlike western espresso machines that extract coffee under rapid pressure, Vietnamese coffee honors patience through the metal "phin" drip filter. Sitting on top of a sturdy glass, the phin slowly releases dark, concentrated droplets over a thick layer of sweetened condensed milk. Watching the coffee drip teaches mindfulness—reminding busy city dwellers to slow down and savor the present moment.

### Creative Innovations: Egg and Coconut Coffee
Vietnamese cafe culture is renowned for inventive creations born out of necessity and culinary flair. In the 1940s, during milk shortages in Hanoi, a creative bartender named Nguyen Van Giang whipped egg yolks with sugar to create the legendary "Ca phe trung" (Egg Coffee). Today, contemporary cafes also serve iced coconut coffee, salted coffee from Hue, and avocado coffee, captivating domestic learners and international tourists alike.
      `,
      contentVi: `
# Câu chuyện đằng sau văn hóa cà phê độc đáo của Việt Nam

Cà phê ở Việt Nam không chỉ là một thức uống tăng lực buổi sáng; đó là một phong cách sống thư thả, một nghi thức gắn kết cộng đồng và là bản sắc văn hóa đầy tự hào. Ngày nay, Việt Nam tự hào là quốc gia xuất khẩu cà phê lớn thứ hai thế giới và dẫn đầu về sản lượng cà phê Robusta.

### Chiếc phin truyền thống
Khác với máy pha cà phê phương Tây chiết xuất dưới áp suất nhanh, cà phê Việt Nam tôn vinh sự kiên nhẫn qua chiếc phin kim loại. Đặt trên chiếc ly thủy tinh chắc chắn, phin chậm rãi nhỏ từng giọt đậm đặc lên lớp sữa đặc ngọt ngào. Ngắm từng giọt cà phê rơi nhắc nhở người thành thị bận rộn sống chậm lại và tận hưởng khoảnh khắc hiện tại.

### Những sáng tạo độc đáo: Cà phê trứng và cà phê cốt dừa
Văn hóa cà phê Việt Nam nổi tiếng với những biến tấu tài tình. Vào những năm 1940, trong thời kỳ khan hiếm sữa tại Hà Nội, cụ Nguyễn Văn Giảng đã đánh bông lòng đỏ trứng với đường để tạo ra món "Cà phê trứng" trứ danh. Ngày nay, các quán cà phê hiện đại còn phục vụ cà phê cốt dừa, cà phê muối xứ Huế và cà phê bơ, làm say lòng người bản xứ lẫn du khách quốc tế.
      `,
    },
    {
      slug: 'future-of-remote-work',
      title: 'How Remote Work Is Reshaping Modern Careers',
      titleVi: 'Làm việc từ xa định hình lại sự nghiệp hiện đại như thế nào',
      summary: 'Examining global digital nomadism, asynchronous collaboration, and work-life harmony.',
      readingTime: 7,
      level: EnglishLevel.INTERMEDIATE,
      content: `
# How Remote Work Is Reshaping Modern Careers

Over the past decade, technological advancements and cloud computing platforms have redefined our understanding of the physical workplace. For knowledge workers across Vietnam and around the globe, the concept of spending forty hours a week in a physical office cubicle has shifted toward flexible, remote, and hybrid arrangements.

### Global Opportunities Without Relocation
One of the most profound impacts of remote work for Vietnamese professionals is access to international employment. Highly skilled software engineers, graphic designers, and digital marketers can now collaborate with companies in Silicon Valley, Singapore, or London from their apartments in Da Nang or Ho Chi Minh City, earning competitive global compensation while staying close to their families.

### The Rise of Asynchronous Collaboration
Effective remote environments rely on asynchronous communication—exchanging detailed documentation, code repositories, and project tickets rather than demanding instant answers in meetings. This model demands strong written English skills, self-discipline, and proactive time management.
      `,
      contentVi: `
# Làm việc từ xa định hình lại sự nghiệp hiện đại như thế nào

Trong thập kỷ qua, các tiến bộ công nghệ và nền tảng điện toán đám mây đã định nghĩa lại khái niệm về nơi làm việc truyền thống. Đối với những người lao động tri thức tại Việt Nam và trên toàn thế giới, việc ngồi 40 giờ một tuần tại văn phòng đã chuyển dịch mạnh mẽ sang mô hình linh hoạt, làm việc từ xa và kết hợp (hybrid).

### Cơ hội toàn cầu mà không cần rời xa quê hương
Một trong những tác động sâu sắc nhất của làm việc từ xa đối với các chuyên gia Việt Nam là khả năng tiếp cận thị trường lao động quốc tế. Các kỹ sư phần mềm, nhà thiết kế đồ họa và chuyên viên tiếp thị số có thể hợp tác với các tập đoàn tại Thung lũng Silicon, Singapore hay London ngay từ căn hộ của mình ở Đà Nẵng hay TP.HCM với mức thu nhập cạnh tranh toàn cầu.

### Sự trỗi dậy của giao tiếp bất đồng bộ
Môi trường làm việc từ xa hiệu quả phụ thuộc vào giao tiếp bất đồng bộ (asynchronous communication)—trao đổi qua tài liệu chi tiết, mã nguồn và hệ thống quản lý tác vụ thay vì họp hành liên miên. Mô hình này đòi hỏi kỹ năng viết tiếng Anh tốt, tính kỷ luật cao và khả năng quản lý thời gian chủ động.
      `,
    },
    {
      slug: 'science-of-sleep',
      title: 'How Sleep Enhances Memory and Brain Power',
      titleVi: 'Khoa học giấc ngủ cải thiện trí nhớ và trí lực',
      summary: 'Understanding the biological stages of sleep and their vital role in consolidating foreign vocabulary.',
      readingTime: 6,
      level: EnglishLevel.INTERMEDIATE,
      content: `
# How Sleep Enhances Memory and Brain Power

When studying a new language like English, many learners mistakenly sacrifice sleep to squeeze in extra hours of late-night vocabulary drilling. However, neurological research demonstrates that sleep is not a passive state of rest; it is an active biological phase indispensable for memory consolidation.

### The Memory Consolidation Process
Throughout the day, newly learned information—such as English idioms or grammatical tenses—is stored temporarily in the hippocampus, a brain region with limited storage capacity. During deep Non-Rapid Eye Movement (NREM) sleep, slow electrical brainwaves transfer these fragile memories into the neocortex for long-term retention. Without sufficient sleep, new words fade away like sketches drawn on sand.

### REM Sleep and Creative Linguistic Problem-Solving
Later in the night, Rapid Eye Movement (REM) sleep takes over. In this dreaming stage, the brain connects newly acquired vocabulary with existing knowledge webs. This synthesis allows learners to form intuitive grammatical connections and speak more spontaneously without translating literally from their native tongue.
      `,
      contentVi: `
# Khoa học giấc ngủ cải thiện trí nhớ và trí lực

Khi học một ngôn ngữ mới như tiếng Anh, nhiều bạn học sinh thường hy sinh giấc ngủ để cố gắng nhồi nhét từ vựng vào đêm khuya. Tuy nhiên, các nghiên cứu thần kinh học chứng minh rằng giấc ngủ không phải là trạng thái nghỉ ngơi thụ động, mà là giai đoạn sinh học tích cực không thể thiếu để củng cố trí nhớ dài hạn.

### Quá trình củng cố trí nhớ
Suốt cả ngày, các thông tin mới học—như các thành ngữ hay thì ngữ pháp—được lưu trữ tạm thời tại vùng hồi hải mã (hippocampus), một khu vực có dung lượng giới hạn. Trong giấc ngủ sâu (NREM), các sóng não chậm sẽ chuyển các ký ức này sang vỏ não để lưu trữ vĩnh viễn. Thiếu ngủ, từ vựng mới sẽ nhanh chóng biến mất như vẽ trên cát.

### Giấc ngủ REM và phản xạ ngôn ngữ tự nhiên
Về nửa sau của giấc ngủ, giai đoạn chuyển động mắt nhanh (REM) bắt đầu. Ở giai đoạn này, não bộ liên kết các từ vựng mới với mạng lưới kiến thức cũ. Sự tổng hợp này giúp người học hình thành phản xạ ngữ pháp tự nhiên và nói tiếng Anh trôi chảy mà không cần dịch từng từ trong đầu.
      `,
    },
    {
      slug: 'sustainable-cities',
      title: 'Building Greener, Sustainable Cities for Tomorrow',
      titleVi: 'Xây dựng thành phố xanh và bền vững cho tương lai',
      summary: 'Urban planning innovations: renewable transit, green architecture, and zero-waste initiatives.',
      readingTime: 6,
      level: EnglishLevel.UPPER_INTERMEDIATE,
      content: `
# Building Greener, Sustainable Cities for Tomorrow

More than half of the human population currently lives in urban areas, a figure projected to rise to nearly seventy percent by 2050. As metropolitan centers expand rapidly, urban planners and environmental engineers are reimagining city landscapes to combat climate change, reduce emissions, and elevate the quality of human life.

### Clean Public Transportation Networks
Transitioning away from private fossil fuel vehicles is paramount. Forward-thinking metropolises are expanding electric bus rapid transit (BRT) systems, pedestrian-friendly corridors, and dedicated bicycle highways. In cities like Hanoi and Ho Chi Minh City, modern metro rail lines are gradually relieving traffic congestion while cutting urban carbon footprints.

### Biophilic Architecture and Urban Forestry
Green architecture integrates living vegetation directly into structural facades. Rooftop gardens, vertical forests, and urban parks do much more than beautify concrete jungles; they absorb carbon dioxide, lower ambient temperatures during sweltering summers, and reduce the harmful urban heat island effect.
      `,
      contentVi: `
# Xây dựng thành phố xanh và bền vững cho tương lai

Hơn một nửa dân số thế giới hiện đang sinh sống tại các đô thị, và con số này dự kiến sẽ chạm mốc 70% vào năm 2050. Khi các trung tâm đô thị mở rộng nhanh chóng, các nhà quy hoạch và kỹ sư môi trường đang tái thiết diện mạo thành phố để thích ứng với biến đổi khí hậu, giảm phát thải và nâng cao chất lượng cuộc sống.

### Mạng lưới giao thông công cộng xanh
Việc chuyển dịch khỏi các phương tiện cá nhân chạy nhiên liệu hóa thạch là yếu tố sống còn. Các đô thị tiến bộ đang mở rộng hệ thống xe buýt điện, các tuyến phố đi bộ và đường dành riêng cho xe đạp. Tại Hà Nội và TP.HCM, các tuyến đường sắt đô thị đang từng bước giải tỏa ùn tắc giao thông và giảm thiểu lượng khí thải carbon.

### Kiến trúc sinh thái và lâm nghiệp đô thị
Kiến trúc xanh tích hợp thảm thực vật sống trực tiếp vào mặt đứng công trình. Vườn trên mái, rừng thẳng đứng và công viên cây xanh không chỉ làm đẹp thêm cho cảnh quan bê tông; chúng còn hấp thụ khí CO2, làm giảm nhiệt độ mùa hè và hạn chế hiệu ứng đảo nhiệt đô thị nguy hại.
      `,
    },
  ];

  const createdReadingArticles = new Map<string, string>();
  for (const item of readingArticlesData) {
    const record = await prisma.readingArticle.create({ data: item });
    createdReadingArticles.set(record.slug, record.id);
  }

  // ==============================================
  // 8. Seed Quizzes & Questions (5+ quizzes)
  // ==============================================
  console.log('Seeding quizzes and questions with all question types...');
  const quizzesData = [
    {
      title: 'Everyday Grammar Diagnostic Quiz',
      description: 'Comprehensive test covering foundational tenses, modal verbs, sentence ordering, and matching.',
      level: EnglishLevel.BEGINNER,
      difficulty: Difficulty.EASY,
      timeLimit: 15,
      passingScore: 70,
      listeningLessonSlug: null,
      readingArticleSlug: null,
      grammarLessonSlug: 'present-simple-tense',
      questions: [
        {
          prompt: 'Every weekend, Nam _____ his bicycle around West Lake in Hanoi.',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'ride' },
            { id: 'b', text: 'rides' },
            { id: 'c', text: 'is riding' },
            { id: 'd', text: 'has ridden' },
          ],
          correctAnswer: 'b',
          explanation: 'Habitual action with third person singular subject "Nam" takes "rides".',
          explanationVi: 'Thói quen lặp lại với chủ ngữ số ít "Nam" cần chia động từ thêm "s": "rides".',
          points: 20,
        },
        {
          prompt: 'The present continuous tense is often used to describe confirmed future arrangements.',
          questionType: QuestionType.TRUE_FALSE,
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ],
          correctAnswer: 'true',
          explanation: 'Present continuous is standard for confirmed future appointments.',
          explanationVi: 'Thì hiện tại tiếp diễn thường dùng để diễn tả kế hoạch chắc chắn trong tương lai gần.',
          points: 20,
        },
        {
          prompt: 'Fill in the blank with the correct preposition: "Our tech firm was founded _____ 2021."',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'in',
          explanation: 'Calendar years require preposition "in".',
          explanationVi: 'Các năm luôn đi kèm giới từ "in".',
          points: 20,
        },
        {
          prompt: 'Match each modal verb with its intended function:',
          questionType: QuestionType.MATCHING,
          options: {
            pairs: [
              { leftId: '1', left: 'Must', rightId: 'a', right: 'Obligation / Legal requirement' },
              { leftId: '2', left: 'Should', rightId: 'b', right: 'Friendly recommendation' },
              { leftId: '3', left: 'Might', rightId: 'c', right: 'Low possibility' },
            ],
          },
          correctAnswer: '1:a,2:b,3:c',
          explanation: '"Must" indicates duty, "should" gives advice, and "might" expresses possibility.',
          explanationVi: '"Must" là bắt buộc, "should" là lời khuyên, "might" chỉ khả năng.',
          points: 20,
        },
        {
          prompt: 'Rearrange the words to form a grammatically correct sentence:',
          questionType: QuestionType.SENTENCE_ORDERING,
          options: {
            tokens: ['She', 'usually', 'drinks', 'green tea', 'every morning'],
          },
          correctAnswer: 'She usually drinks green tea every morning',
          explanation: 'Adverbs of frequency appear between the subject and the main verb.',
          explanationVi: 'Trạng từ chỉ tần suất đứng giữa chủ ngữ và động từ chính.',
          points: 20,
        },
      ],
    },
    {
      title: 'Listening Check: At the London Cafe',
      description: 'Comprehension quiz based on the conversation between barista and customer.',
      level: EnglishLevel.BEGINNER,
      difficulty: Difficulty.EASY,
      timeLimit: 10,
      passingScore: 75,
      listeningLessonSlug: 'ordering-coffee-in-london',
      readingArticleSlug: null,
      grammarLessonSlug: null,
      questions: [
        {
          prompt: 'What kind of milk did the customer order in their latte?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Almond milk' },
            { id: 'b', text: 'Oat milk' },
            { id: 'c', text: 'Whole dairy milk' },
            { id: 'd', text: 'Soy milk' },
          ],
          correctAnswer: 'b',
          explanation: 'The customer explicitly requested a large oat milk latte.',
          explanationVi: 'Khách hàng đã gọi rõ ràng: "large oat milk latte" (sữa yến mạch).',
          points: 35,
        },
        {
          prompt: 'What pastry did the customer choose to accompany the coffee?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Chocolate chip cookie' },
            { id: 'b', text: 'Blueberry muffin' },
            { id: 'c', text: 'Warm almond croissant' },
            { id: 'd', text: 'Lemon cheesecake' },
          ],
          correctAnswer: 'c',
          explanation: 'The customer ordered a warm almond croissant.',
          explanationVi: 'Khách hàng chọn bánh sừng bò hạnh nhân hâm nóng: "warm almond croissant".',
          points: 35,
        },
        {
          prompt: 'The customer chose to pay in cash.',
          questionType: QuestionType.TRUE_FALSE,
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ],
          correctAnswer: 'false',
          explanation: 'The customer confirmed payment with contactless card, not cash.',
          explanationVi: 'Khách hàng đã thanh toán bằng thẻ chạm (contactless card), không phải tiền mặt.',
          points: 30,
        },
      ],
    },
    {
      title: 'Reading Comprehension: Vietnam Coffee Culture',
      description: 'Assess your understanding of historical and cultural nuances in the reading passage.',
      level: EnglishLevel.BEGINNER,
      difficulty: Difficulty.EASY,
      timeLimit: 12,
      passingScore: 70,
      listeningLessonSlug: null,
      readingArticleSlug: 'vietnam-coffee-culture',
      grammarLessonSlug: null,
      questions: [
        {
          prompt: 'What is Vietnam’s global ranking in terms of total coffee export volume?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'First in the world' },
            { id: 'b', text: 'Second in the world' },
            { id: 'c', text: 'Fifth in the world' },
            { id: 'd', text: 'Tenth in the world' },
          ],
          correctAnswer: 'b',
          explanation: 'Vietnam is the second-largest exporter of coffee in the world.',
          explanationVi: 'Bài đọc nêu rõ Việt Nam là nước xuất khẩu cà phê lớn thứ hai thế giới (sau Brazil).',
          points: 35,
        },
        {
          prompt: 'What utensil is traditionally placed on top of the glass in Vietnamese coffee brewing?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'A French press' },
            { id: 'b', text: 'A metal "phin" filter' },
            { id: 'c', text: 'An electric moka pot' },
            { id: 'd', text: 'A paper cone dripper' },
          ],
          correctAnswer: 'b',
          explanation: 'Traditional brewing relies on the iconic metal phin filter.',
          explanationVi: 'Pha chế truyền thống sử dụng chiếc phin kim loại nhỏ giọt.',
          points: 35,
        },
        {
          prompt: 'Why was Egg Coffee originally invented in Hanoi during the 1940s?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Due to severe milk shortages' },
            { id: 'b', text: 'To cater to French tourists' },
            { id: 'c', text: 'As a medical tonic for athletes' },
            { id: 'd', text: 'By a royal emperor’s decree' },
          ],
          correctAnswer: 'a',
          explanation: 'Egg coffee was invented during historical shortages of fresh and condensed milk.',
          explanationVi: 'Cà phê trứng ra đời do sự khan hiếm sữa trong thời kỳ những năm 1940.',
          points: 30,
        },
      ],
    },
    {
      title: 'Reading Comprehension: Bilingual Brain Power',
      description: 'Test your grasp of neuroscience terminology and arguments in the article.',
      level: EnglishLevel.INTERMEDIATE,
      difficulty: Difficulty.MEDIUM,
      timeLimit: 15,
      passingScore: 70,
      listeningLessonSlug: null,
      readingArticleSlug: 'benefits-of-bilingualism',
      grammarLessonSlug: null,
      questions: [
        {
          prompt: 'According to studies cited in the text, by how many years can bilingualism delay Alzheimer symptoms?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: '1 to 2 years' },
            { id: 'b', text: '4 to 5 years' },
            { id: 'c', text: '8 to 10 years' },
            { id: 'd', text: 'It has no measured effect' },
          ],
          correctAnswer: 'b',
          explanation: 'The research shows a delay of on average 4 to 5 years.',
          explanationVi: 'Nghiên cứu chỉ ra việc nói hai ngôn ngữ giúp làm chậm triệu chứng Alzheimer trung bình 4 đến 5 năm.',
          points: 35,
        },
        {
          prompt: 'What cognitive mechanism explains why bilingual speakers excel in multitasking?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'They require fewer hours of sleep' },
            { id: 'b', text: 'Constant practice choosing between two linguistic systems while inhibiting irrelevant words' },
            { id: 'c', text: 'They possess larger photographic memory' },
            { id: 'd', text: 'They read faster than monolinguals' },
          ],
          correctAnswer: 'b',
          explanation: 'The brain continuously exercises executive control by selecting relevant words and inhibiting the other language.',
          explanationVi: 'Não bộ liên tục luyện tập khả năng lựa chọn giữa 2 hệ ngôn ngữ và ức chế từ không phù hợp.',
          points: 35,
        },
        {
          prompt: 'Which brain region temporarily holds new vocabulary before it is transferred during sleep?',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Hippocampus' },
            { id: 'b', text: 'Neocortex' },
            { id: 'c', text: 'Spinal cord' },
            { id: 'd', text: 'Brain stem' },
          ],
          correctAnswer: 'a',
          explanation: 'The hippocampus stores temporary memories before deep sleep transfers them to the neocortex.',
          explanationVi: 'Hồi hải mã (Hippocampus) là nơi lưu trữ ký ức tạm thời.',
          points: 30,
        },
      ],
    },
    {
      title: 'General Intermediate English Proficiency Assessment',
      description: 'Comprehensive test covering vocabulary, prepositions, collocations, and sentence structures.',
      level: EnglishLevel.INTERMEDIATE,
      difficulty: Difficulty.MEDIUM,
      timeLimit: 20,
      passingScore: 75,
      listeningLessonSlug: null,
      readingArticleSlug: null,
      grammarLessonSlug: null,
      questions: [
        {
          prompt: 'Choose the word that means "to discuss formally to reach an agreement":',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'Collaborate' },
            { id: 'b', text: 'Negotiate' },
            { id: 'c', text: 'Commute' },
            { id: 'd', text: 'Unwind' },
          ],
          correctAnswer: 'b',
          explanation: 'To negotiate means to discuss terms formally in business or diplomacy.',
          explanationVi: '"Negotiate" có nghĩa là đàm phán, thương lượng.',
          points: 20,
        },
        {
          prompt: 'Select the correct preposition: "She is capable _____ speaking three languages fluently."',
          questionType: QuestionType.MULTIPLE_CHOICE,
          options: [
            { id: 'a', text: 'to' },
            { id: 'b', text: 'with' },
            { id: 'c', text: 'of' },
            { id: 'd', text: 'at' },
          ],
          correctAnswer: 'c',
          explanation: 'The adjective "capable" is followed by the preposition "of".',
          explanationVi: 'Tính từ "capable" đi kèm giới từ "of" (capable of doing something).',
          points: 20,
        },
        {
          prompt: 'Renewable energy comes from sources like solar and wind that naturally replenish.',
          questionType: QuestionType.TRUE_FALSE,
          options: [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ],
          correctAnswer: 'true',
          explanation: 'Renewable energy is derived from natural resources that constantly regenerate.',
          explanationVi: 'Năng lượng tái tạo xuất phát từ các nguồn tự nhiên tự phục hồi liên tục.',
          points: 20,
        },
        {
          prompt: 'Complete the conditional: "If he had arrived earlier, he _____ (not miss) the train."',
          questionType: QuestionType.FILL_BLANK,
          options: null,
          correctAnswer: 'would not have missed',
          explanation: 'Third conditional requires "would not have + past participle".',
          explanationVi: 'Câu điều kiện loại 3 dùng "would not have missed".',
          points: 20,
        },
        {
          prompt: 'Arrange the tokens into an accurate sentence:',
          questionType: QuestionType.SENTENCE_ORDERING,
          options: {
            tokens: ['The new library', 'was built', 'in 2022', 'by local workers'],
          },
          correctAnswer: 'The new library was built in 2022 by local workers',
          explanation: 'Standard passive word order: Subject + was built + time phrase + by agent.',
          explanationVi: 'Cấu trúc câu bị động chuẩn: Chủ ngữ + was built + cụm thời gian + by tác nhân.',
          points: 20,
        },
      ],
    },
  ];

  const createdQuizzes: { id: string; title: string }[] = [];
  for (const quizItem of quizzesData) {
    const item = quizItem as any;
    const { questions, listeningLessonSlug, readingArticleSlug, grammarLessonSlug, ...quizFields } = item;
    const listeningLessonId = listeningLessonSlug
      ? createdListeningLessons.get(listeningLessonSlug) ?? null
      : null;
    const readingArticleId = readingArticleSlug
      ? createdReadingArticles.get(readingArticleSlug) ?? null
      : null;
    const grammarLessonId = grammarLessonSlug
      ? createdGrammarLessons.get(grammarLessonSlug) ?? null
      : null;

    const quiz = await prisma.quiz.create({
      data: {
        ...quizFields,
        listeningLessonId,
        readingArticleId,
        grammarLessonId,
      },
    });
    createdQuizzes.push({ id: quiz.id, title: quiz.title });

    for (let i = 0; i < questions.length; i++) {
      await prisma.question.create({
        data: {
          ...questions[i],
          quizId: quiz.id,
          order: i + 1,
        },
      });
    }
  }

  // Seed sample QuizAttempt for the learner user
  console.log('Seeding quiz attempts...');
  await prisma.quizAttempt.create({
    data: {
      userId: learner.id,
      quizId: createdQuizzes[0].id,
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      answers: { q1: 'b', q2: 'a', q3: 'b', q4: 'b', q5: 'c' },
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
    },
  });

  // ==============================================
  // 9. Seed Achievements (5+ achievements)
  // ==============================================
  console.log('Seeding achievements...');
  const achievementsData = [
    {
      code: 'FIRST_STEP',
      title: 'First Step',
      titleVi: 'Bước Chân Đầu Tiên',
      description: 'Complete your very first lesson on the platform.',
      descriptionVi: 'Hoàn thành bài học đầu tiên trên ứng dụng.',
      icon: 'sparkles',
      points: 20,
    },
    {
      code: 'VOCAB_50_WORDS',
      title: 'Word Explorer',
      titleVi: 'Nhà Thám Hiểm Từ Vựng',
      description: 'Learn and review 50 vocabulary words.',
      descriptionVi: 'Ghi nhớ và hoàn thành luyện tập 50 từ vựng tiếng Anh.',
      icon: 'book-open',
      points: 50,
    },
    {
      code: 'SEVEN_DAY_STREAK',
      title: 'Unstoppable Habit',
      titleVi: 'Thói Quen Vàng 7 Ngày',
      description: 'Maintain an unbroken daily learning streak for 7 days.',
      descriptionVi: 'Duy trì chuỗi ngày học tập liên tục trong 7 ngày.',
      icon: 'flame',
      points: 100,
    },
    {
      code: 'PERFECT_QUIZ_SCORE',
      title: 'Perfectionist',
      titleVi: 'Điểm Tuyệt Đối',
      description: 'Score 100% on any comprehension quiz.',
      descriptionVi: 'Đạt điểm tuyệt đối 100% trong một bài kiểm tra bất kỳ.',
      icon: 'award',
      points: 60,
    },
    {
      code: 'GRAMMAR_CHAMPION',
      title: 'Grammar Champion',
      titleVi: 'Quán Quân Ngữ Pháp',
      description: 'Successfully finish 10 grammar lessons and their exercises.',
      descriptionVi: 'Hoàn thành 10 bài học ngữ pháp cùng toàn bộ bài tập.',
      icon: 'check-circle-2',
      points: 80,
    },
    {
      code: 'AI_CONVERSATION_EXPLORER',
      title: 'Fluent Talker',
      titleVi: 'Nhà Giao Tiếp Tự Tin',
      description: 'Complete 3 interactive conversations with the AI tutor.',
      descriptionVi: 'Hoàn thành 3 cuộc đối thoại luyện nói cùng trợ lý ảo AI.',
      icon: 'message-square',
      points: 50,
    },
  ];

  const createdAchievements: { id: string; code: string }[] = [];
  for (const ach of achievementsData) {
    const record = await prisma.achievement.create({ data: ach });
    createdAchievements.push({ id: record.id, code: record.code });
  }

  // Seed sample UserAchievement for learner
  console.log('Seeding user achievements...');
  await prisma.userAchievement.create({
    data: {
      userId: learner.id,
      achievementId: createdAchievements[0].id,
      progress: 100,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: learner.id,
      achievementId: createdAchievements[2].id,
      progress: 71.4, // 5 out of 7 days
    },
  });

  // ==============================================
  // 10. Seed Daily Goals & Learning Activities
  // ==============================================
  console.log('Seeding daily goals & activities...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.dailyGoal.create({
    data: {
      userId: learner.id,
      date: yesterday,
      targetMinutes: 20,
      actualMinutes: 25,
      targetWords: 5,
      actualWords: 6,
      completed: true,
    },
  });

  await prisma.dailyGoal.create({
    data: {
      userId: learner.id,
      date: today,
      targetMinutes: 20,
      actualMinutes: 15,
      targetWords: 5,
      actualWords: 4,
      completed: false,
    },
  });

  await prisma.learningActivity.create({
    data: {
      userId: learner.id,
      type: ActivityType.VOCABULARY,
      referenceId: createdTopics.get('daily-routines'),
      durationMinutes: 10,
      score: 90,
      metadata: { wordsReviewed: 5, mastered: 4 },
    },
  });

  await prisma.learningActivity.create({
    data: {
      userId: learner.id,
      type: ActivityType.QUIZ,
      referenceId: createdQuizzes[0].id,
      durationMinutes: 8,
      score: 80,
      metadata: { correctAnswers: 4, totalQuestions: 5 },
    },
  });

  // ==============================================
  // 11. Seed Conversation & Messages (AI Chat)
  // ==============================================
  console.log('Seeding AI conversation...');
  const conversation = await prisma.conversation.create({
    data: {
      userId: learner.id,
      title: 'Practice Ordering at a Restaurant',
      topic: 'Food & Dining Out',
      scenario: 'You are at an Italian bistro ordering dinner. The waiter is welcoming you.',
      level: EnglishLevel.INTERMEDIATE,
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: 'Good evening! Welcome to Bella Italia. Table for one tonight?',
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: 'Yes, please! Could I get a table near the window?',
      feedback: {
        grammarScore: 100,
        tip: 'Great natural phrasing! "Could I get a table near the window" is polite and accurate.',
      },
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: 'Right this way! Here is your menu. Can I get you started with some sparkling water or a cold drink while you look over the specials?',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
