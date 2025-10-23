export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow chore(release): X.Y.Z [skip ci] messages
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'release',
      ],
    ],
    'subject-case': [0], // optionally relax subject-case
  },
  // Allow chore(release): ... as an exception
  ignores: [(commit) => commit.startsWith('chore(release):')],
};
