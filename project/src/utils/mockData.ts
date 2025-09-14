import { Document, Lecture, LectureSection, Note, Question } from '../types';

export const mockDocuments: Document[] = [
  {
    _id: '1',
    name: 'Introduction to Machine Learning',
    url: 'intro-to-ml.pdf',
    size: 1458000,
    status: 'success',
    thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2023-06-15T10:30:00Z',
    updatedAt: '2023-06-15T10:30:00Z',
  },
  {
    _id: '2',
    name: 'Advanced React Patterns',
    url: 'react-patterns.pdf',
    size: 2540000,
    status: 'success',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2023-07-02T14:15:00Z',
    updatedAt: '2023-07-02T14:15:00Z',
  },
  {
    _id: '3',
    name: 'Quantum Computing Basics',
    url: 'quantum-basics.docx',
    size: 1240000,
    status: 'pending',
    thumbnail: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    createdAt: '2023-07-10T09:45:00Z',
    updatedAt: '2023-07-10T09:45:00Z',
  },
];

export const mockLectureSections: LectureSection[] = [
  {
    id: 's1',
    title: 'Introduction',
    content: 'Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. In this lecture, we will explore the fundamental concepts of machine learning, including supervised learning, unsupervised learning, and reinforcement learning.',
    order: 1,
  },
  {
    id: 's2',
    title: 'Supervised Learning',
    content: 'Supervised learning is the machine learning task of learning a function that maps an input to an output based on example input-output pairs. It infers a function from labeled training data consisting of a set of training examples. In supervised learning, each example is a pair consisting of an input object (typically a vector) and a desired output value (also called the supervisory signal). A supervised learning algorithm analyzes the training data and produces an inferred function, which can be used for mapping new examples.',
    order: 2,
  },
  {
    id: 's3',
    title: 'Unsupervised Learning',
    content: 'Unsupervised learning is a type of machine learning algorithm used to draw inferences from datasets consisting of input data without labeled responses. The most common unsupervised learning method is cluster analysis, which is used for exploratory data analysis to find hidden patterns or grouping in data. The clusters are modeled using a measure of similarity which is defined upon metrics such as Euclidean or probabilistic distance.',
    order: 3,
  },
  {
    id: 's4',
    title: 'Reinforcement Learning',
    content: 'Reinforcement learning is an area of machine learning concerned with how software agents ought to take actions in an environment in order to maximize the notion of cumulative reward. Reinforcement learning differs from supervised learning in not needing labeled input/output pairs be presented, and in not needing sub-optimal actions to be explicitly corrected. Instead the focus is on finding a balance between exploration (of uncharted territory) and exploitation (of current knowledge).',
    order: 4,
  },
  {
    id: 's5',
    title: 'Applications',
    content: 'Machine learning has been applied to various domains, including computer vision, natural language processing, and robotics. In computer vision, machine learning algorithms can be used for image classification, object detection, and facial recognition. In natural language processing, applications include machine translation, sentiment analysis, and text generation. In robotics, machine learning enables robots to learn from their interactions with the environment and improve their performance over time.',
    order: 5,
  },
];

export const mockLecture: Lecture = {
  id: 'l1',
  documentId: '1',
  simulationId: 'sim1',
  title: 'Introduction to Machine Learning',
  sections: mockLectureSections,
  createdAt: '2023-06-15T11:30:00Z',
  updatedAt: '2023-06-15T11:30:00Z',
};

export const mockNotes: Note[] = [
  {
    id: 'n1',
    simulationId: 'sim1',
    sectionId: 's1',
    content: 'ML is a subset of AI - focuses on learning from data without explicit programming.',
    createdAt: '2023-06-15T11:35:00Z',
    updatedAt: '2023-06-15T11:35:00Z',
  },
  {
    id: 'n2',
    simulationId: 'sim1',
    sectionId: 's2',
    content: 'Supervised learning uses labeled data to train models. Examples: classification, regression.',
    createdAt: '2023-06-15T11:40:00Z',
    updatedAt: '2023-06-15T11:40:00Z',
  },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    simulationId: 'sim1',
    sectionId: 's1',
    question: 'What is the main difference between machine learning and traditional programming?',
    answer: 'In traditional programming, a programmer writes explicit rules to solve a problem. In machine learning, the algorithm learns patterns from data to make predictions or decisions without being explicitly programmed with rules. Machine learning models improve their performance over time as they are exposed to more data.',
    createdAt: '2023-06-15T12:00:00Z',
  },
  {
    id: 'q2',
    simulationId: 'sim1',
    sectionId: 's2',
    question: 'Can you explain the difference between classification and regression in supervised learning?',
    answer: 'Classification and regression are both types of supervised learning tasks. Classification involves predicting a categorical label (e.g., spam/not spam, cat/dog), while regression involves predicting a continuous numerical value (e.g., house prices, temperature). Classification models output probabilities or discrete class labels, whereas regression models output continuous values.',
    createdAt: '2023-06-15T12:05:00Z',
  },
];