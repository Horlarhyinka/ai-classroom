'use client'

import React from 'react';
import ClassroomInterface from '../../../components/ClassroomInterface';

const mockSection = {
  id: 'section-1',
  title: 'Introduction to Machine Learning',
  content: `Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. 

In this comprehensive introduction, we'll explore the fundamental concepts that make machine learning such a powerful tool in today's technology landscape. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.

Key concepts we'll cover include supervised learning, where algorithms learn from labeled training data; unsupervised learning, which finds hidden patterns in data without labeled examples; and reinforcement learning, where agents learn through interaction with their environment to maximize cumulative reward.`,
  duration: 480 // 8 minutes
};

export default function ClassroomPage() {
  const handleSectionComplete = () => {
    console.log('Section completed!');
    // Handle section completion logic here
  };

  return (
    <ClassroomInterface 
      section={mockSection}
      onSectionComplete={handleSectionComplete}
    />
  );
}