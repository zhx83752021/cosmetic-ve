module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // 新功能
                'fix',      // 修复bug
                'docs',     // 文档更新
                'style',    // 代码格式调整
                'refactor', // 代码重构
                'perf',     // 性能优化
                'test',     // 测试相关
                'chore',    // 构建/工具链相关
                'revert',   // 回滚
                'build'     // 构建相关
            ]
        ],
        'subject-case': [0]
    }
}
