import { getDb, closeDb, persistDb } from './connection';

interface SeedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SeedQuiz {
  id: string;
  title: string;
  description: string;
  questions: SeedQuestion[];
}

const seedData: SeedQuiz[] = [
  {
    id: 'agent-fundamentals',
    title: 'Agent Fundamentals',
    description: 'Test your knowledge of AI agent concepts, tools, and reasoning patterns.',
    questions: [
      {
        question: 'What is the primary role of an agent in an AI system?',
        options: [
          'To execute a specific task autonomously',
          'To store data',
          'To render UI components',
          'To manage database connections',
        ],
        correctAnswer: 0,
        explanation:
          "An agent's primary role is to execute tasks autonomously, using tools and reasoning to achieve goals.",
      },
      {
        question: 'What is a "tool" in the context of AI agents?',
        options: [
          'A software library',
          'A function the agent can call to interact with external systems',
          'A debugging utility',
          'A UI component',
        ],
        correctAnswer: 1,
        explanation:
          'Tools are functions that agents can invoke to interact with external systems, APIs, or data sources.',
      },
      {
        question: 'What does "ReAct" stand for in agent design?',
        options: [
          'React library',
          'Reasoning and Acting',
          'Reactive Actions',
          'Real-time Action Control',
        ],
        correctAnswer: 1,
        explanation:
          'ReAct (Reasoning + Acting) is a pattern where agents alternate between reasoning about their state and taking actions.',
      },
      {
        question: 'What is a "system prompt"?',
        options: [
          'A prompt written by the user',
          "Initial instructions that define an agent's behavior and constraints",
          "The agent's output",
          'An error message',
        ],
        correctAnswer: 1,
        explanation:
          "The system prompt provides initial instructions that set the agent's behavior, personality, and constraints.",
      },
      {
        question: 'What is the purpose of "chain-of-thought" prompting?',
        options: [
          'To execute multiple prompts in sequence',
          'To encourage step-by-step reasoning',
          'To chain API calls',
          'To create a feedback loop',
        ],
        correctAnswer: 1,
        explanation:
          'Chain-of-thought encourages models to break down complex problems into intermediate reasoning steps.',
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description:
      'Explore techniques for crafting effective prompts to get the best results from AI models.',
    questions: [
      {
        question: 'What is prompt engineering?',
        options: [
          'Writing code to manage prompts',
          'The practice of designing and optimizing inputs to AI models',
          'Engineering hardware for prompt processing',
          'A programming language',
        ],
        correctAnswer: 1,
        explanation:
          'Prompt engineering is the practice of crafting and refining inputs to get desired outputs from AI models.',
      },
      {
        question: 'What is a "few-shot" prompt?',
        options: [
          'A prompt with few words',
          "A prompt that includes examples to guide the model's response",
          'A prompt that takes few seconds to execute',
          'A prompt with minimal context',
        ],
        correctAnswer: 1,
        explanation:
          'Few-shot prompting includes examples in the prompt to demonstrate the desired output format or reasoning.',
      },
      {
        question: 'What does temperature control in an LLM?',
        options: [
          'The speed of response',
          'The randomness and creativity of output',
          'The length of output',
          'The memory usage',
        ],
        correctAnswer: 1,
        explanation:
          'Temperature controls the randomness of token selection — higher values produce more creative but less focused outputs.',
      },
      {
        question: 'What is the difference between zero-shot and one-shot prompting?',
        options: [
          'There is no difference',
          'Zero-shot gives no examples, one-shot gives one example',
          'One-shot is faster',
          'Zero-shot is more accurate',
        ],
        correctAnswer: 1,
        explanation:
          "Zero-shot provides no examples and relies on the model's pre-existing knowledge, while one-shot provides a single example.",
      },
      {
        question: 'What is "output formatting" in prompt engineering?',
        options: [
          'The visual design of the output',
          'Specifying the desired structure (JSON, XML, etc.) of the response',
          "Formatting the prompt's appearance",
          'Compressing the output',
        ],
        correctAnswer: 1,
        explanation:
          'Output formatting instructs the model to return responses in a specific structure like JSON, XML, or markdown.',
      },
    ],
  },
  {
    id: 'model-selection',
    title: 'Model Selection',
    description:
      'Understand the factors involved in choosing the right AI model for your use case.',
    questions: [
      {
        question:
          'What is the key consideration when choosing between GPT-4 and a smaller model like GPT-3.5?',
        options: [
          'Cost vs. capability tradeoff',
          "Model size doesn't matter",
          'Always choose the larger model',
          'API availability',
        ],
        correctAnswer: 0,
        explanation:
          'The choice involves balancing capability needs against cost, latency, and resource requirements.',
      },
      {
        question: 'What does "context window" refer to?',
        options: [
          'The browser window',
          'The maximum amount of text a model can process at once',
          'The output length',
          'The training data size',
        ],
        correctAnswer: 1,
        explanation:
          'The context window is the maximum input size a model can handle, including both prompt and any ongoing conversation.',
      },
      {
        question: 'What is model fine-tuning?',
        options: [
          "Adjusting the model's output temperature",
          'Training a pre-trained model on additional domain-specific data',
          "Changing the model's architecture",
          'Selecting model parameters at inference',
        ],
        correctAnswer: 1,
        explanation:
          'Fine-tuning adapts a pre-trained model to specific tasks or domains by training it on additional curated data.',
      },
      {
        question: 'What is the primary advantage of open-source models?',
        options: [
          "They're always free to run",
          'They offer transparency, customization, and community support',
          "They're always more accurate",
          'They require less hardware',
        ],
        correctAnswer: 1,
        explanation:
          'Open-source models provide transparency into training data, allow customization, and benefit from community contributions.',
      },
      {
        question: 'What is latency in the context of model selection?',
        options: [
          'The time between sending a request and receiving a response',
          "The model's accuracy score",
          'The training duration',
          'The number of parameters',
        ],
        correctAnswer: 0,
        explanation:
          'Latency is the response time from request submission to output delivery, critical for real-time applications.',
      },
    ],
  },
];

async function seed(): Promise<void> {
  const db = await getDb();

  // Clear existing data
  db.run('DELETE FROM attempts');
  db.run('DELETE FROM questions');
  db.run('DELETE FROM quizzes');

  for (const quiz of seedData) {
    db.run('INSERT INTO quizzes (id, title, description) VALUES (?, ?, ?)', [
      quiz.id,
      quiz.title,
      quiz.description,
    ]);
    quiz.questions.forEach((q) => {
      db.run(
        'INSERT INTO questions (quiz_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
        [quiz.id, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation],
      );
    });
  }

  persistDb();

  const quizResult = db.exec('SELECT COUNT(*) as count FROM quizzes');
  const questionResult = db.exec('SELECT COUNT(*) as count FROM questions');

  const quizCount = quizResult[0]?.values[0]?.[0] ?? 0;
  const questionCount = questionResult[0]?.values[0]?.[0] ?? 0;

  console.log(`Seed complete: ${quizCount} quizzes, ${questionCount} questions`);
  closeDb();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
