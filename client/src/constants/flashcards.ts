import type { ExtractableCard } from '../types';

export const sampleTexts = [
  {
    label: 'Đoạn văn IT',
    text: `Software deployment is the process of making a new application or update available to users. Modern deployment pipelines use continuous integration and continuous delivery (CI/CD) to automate testing and release cycles. Containerization with tools like Docker ensures consistent environments across development, staging, and production servers. Scalability and reliability are key considerations for any enterprise-grade system.`,
  },
  {
    label: 'Đoạn văn kinh doanh',
    text: `Revenue growth requires strategic stakeholder engagement and effective negotiation. Companies must leverage their competitive advantage while maintaining operational efficiency. Quarterly performance reviews help identify opportunities for optimization and risk mitigation. Sustainable profitability depends on customer acquisition and retention strategies.`,
  },
];

export const extractWordsFromText = (text: string): ExtractableCard[] => {
  const wordMap: Record<string, Omit<ExtractableCard, 'id'>> = {
    deployment: { word: 'Deployment', meaning: 'Triển khai (phần mềm)', phonetic: '/dɪˈplɔɪmənt/', example: 'The deployment was completed without any downtime.', topic: 'IT', difficulty: 'medium', isSaved: false },
    pipeline: { word: 'Pipeline', meaning: 'Quy trình xử lý liên tục', phonetic: '/ˈpaɪplaɪn/', example: 'Our CI/CD pipeline automates the release process.', topic: 'IT', difficulty: 'hard', isSaved: false },
    containerization: { word: 'Containerization', meaning: 'Container hóa ứng dụng', phonetic: '/kənˌteɪnəraɪˈzeɪʃn/', example: 'Containerization ensures consistent environments.', topic: 'IT', difficulty: 'hard', isSaved: false },
    scalability: { word: 'Scalability', meaning: 'Khả năng mở rộng', phonetic: '/ˌskeɪləˈbɪlɪti/', example: 'Scalability is critical for enterprise systems.', topic: 'IT', difficulty: 'hard', isSaved: false },
    reliability: { word: 'Reliability', meaning: 'Độ tin cậy, tính ổn định', phonetic: '/rɪˌlaɪəˈbɪlɪti/', example: 'System reliability determines user trust.', topic: 'IT', difficulty: 'medium', isSaved: false },
    revenue: { word: 'Revenue', meaning: 'Doanh thu', phonetic: '/ˈrevənjuː/', example: 'Revenue increased by 30% this quarter.', topic: 'Business', difficulty: 'medium', isSaved: false },
    stakeholder: { word: 'Stakeholder', meaning: 'Bên liên quan, cổ đông', phonetic: '/ˈsteɪkhoʊldər/', example: 'We need to update all stakeholders on the progress.', topic: 'Business', difficulty: 'hard', isSaved: false },
    negotiation: { word: 'Negotiation', meaning: 'Đàm phán, thương lượng', phonetic: '/nɪˌɡoʊʃiˈeɪʃn/', example: 'The negotiation resulted in a favorable contract.', topic: 'Business', difficulty: 'medium', isSaved: false },
  };

  const found: ExtractableCard[] = [];
  const lower = text.toLowerCase();
  let index = 1;

  for (const [key, card] of Object.entries(wordMap)) {
    if (lower.includes(key)) {
      found.push({ id: String(index++), ...card });
    }
  }

  return found.length > 0 ? found : [
    { id: '1', word: 'Enterprise', meaning: 'Doanh nghiệp lớn', phonetic: '/ˈentərpraɪz/', example: 'Enterprise software requires robust security.', topic: 'General', difficulty: 'medium', isSaved: false }
  ];
};
