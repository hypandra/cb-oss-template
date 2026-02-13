import { FlowCanvas } from '@/components/recipes/reactflow-canvas/FlowCanvas'

export default function CanvasDemoPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-pretty">
        Double-click on empty space to add nodes. Drag between handles to connect.
      </p>
      <FlowCanvas nodesEndpoint="/api/demo/nodes" edgesEndpoint="/api/demo/edges" />
    </div>
  )
}
