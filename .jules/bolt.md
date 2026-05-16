# Bolt's Journal - Performance Optimization

## 2026-05-16 - FontAwesome Bundle Size Bloat
**Learning:** Importing entire FontAwesome icon sets (`fas`, `far`, `fab`) in a Vite project prevents tree-shaking, leading to massive bundle sizes (over 2MB for a small portfolio site).
**Action:** Always audit used icons across the codebase and use individual icon imports in `src/main.js` to minimize the JS payload. This single change reduced the bundle by ~78%.
