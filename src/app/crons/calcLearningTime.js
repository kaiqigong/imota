import calcLearningTimeOf from './calcLearningTimeOf';

calcLearningTimeOf(new Date()).then(() => process.exit(0), () => process.exit(1));
