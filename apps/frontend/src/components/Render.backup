import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@prodgenie/libs/ui';

const schema = {
  bom: {
    header: {
      expected: ['slNo', 'description', 'material'],
      required: ['description', 'material'],
    },
  },
  titleBlock: {
    header: {
      expected: ['drawingNumber'],
      required: [],
    },
  },
  printingDetail: {
    header: {
      expected: ['printingDetail', 'printingColour'],
      required: [],
    },
  },
};

export default function RenderSchemaConfig() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(schema).map(([section, { header }]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Expected Fields</h4>
              <div className="flex flex-wrap gap-2">
                {header.expected.map((field, i) => (
                  <Badge key={i} variant="default">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Required Fields</h4>
              <div className="flex flex-wrap gap-2">
                {header.required.length > 0 ? (
                  header.required.map((field, i) => (
                    <Badge key={i} variant="secondary">
                      {field}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">None</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
