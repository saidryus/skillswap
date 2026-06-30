/**
 * Skeleton loading components for perceived performance.
 * Usage:
 *   <Skeleton.Card />
 *   <Skeleton.Table rows={5} />
 *   <Skeleton.Stats count={4} />
 *   <Skeleton.Text lines={3} />
 */

function Box({ className = '', width, height }) {
  return (
    <div
      className={`skeleton animate-pulse rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
}

function Card() {
  return (
    <div className="rounded-2xl border border-surface-200 dark:border-surface-800 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Box className="h-4 w-24" />
        <Box className="h-10 w-10 rounded-xl" />
      </div>
      <Box className="h-8 w-16" />
      <Box className="h-3 w-32" />
    </div>
  );
}

function Stats({ count = 4 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  );
}

function TableRow() {
  return (
    <tr>
      <td className="px-5 py-4"><Box className="h-4 w-32" /></td>
      <td className="px-5 py-4"><Box className="h-4 w-40" /></td>
      <td className="px-5 py-4"><Box className="h-4 w-20" /></td>
      <td className="px-5 py-4"><Box className="h-4 w-16" /></td>
      <td className="px-5 py-4"><Box className="h-5 w-16 rounded-full" /></td>
      <td className="px-5 py-4"><Box className="h-4 w-12" /></td>
    </tr>
  );
}

function Table({ rows = 5, cols = 6 }) {
  return (
    <div className="rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      <div className="bg-surface-50 dark:bg-surface-800/50 px-5 py-3.5 border-b border-surface-200 dark:border-surface-700">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <Box key={i} className="h-3 w-16" />
          ))}
        </div>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Text({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Box key={i} className="h-4" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

function Profile() {
  return (
    <div className="flex items-center gap-4">
      <Box className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Box className="h-4 w-32" />
        <Box className="h-3 w-24" />
      </div>
    </div>
  );
}

const Skeleton = { Box, Card, Stats, Table, TableRow, Text, Profile };
export default Skeleton;
