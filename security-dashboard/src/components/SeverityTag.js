export default function SeverityTag({ severity }) {
  const severiy_color_map = {
    'Low': 'bg-yellow-300',
    'Medium': 'bg-orange-300',
    'High': 'bg-red-300',
    'Critical': 'bg-purple-300'
  }

  return <div className={`p-2 rounded w-fit ${severiy_color_map[severity]}`}>{severity}</div>
}