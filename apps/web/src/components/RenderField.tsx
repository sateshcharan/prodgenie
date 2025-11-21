import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@prodgenie/libs/ui/select';
import { Input } from '@prodgenie/libs/ui/input';
import { Checkbox } from '@prodgenie/libs/ui/checkbox';

const RenderField = ({ fieldConfig, rhfField }: any) => {
  switch (fieldConfig.type) {
    case 'select':
      return (
        <Select value={rhfField.value} onValueChange={rhfField.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={fieldConfig.placeholder || 'Select'} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.dataSource.options.map((opt: any, i: number) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <Checkbox
          checked={!!rhfField.value}
          onCheckedChange={rhfField.onChange}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={fieldConfig.placeholder}
          value={rhfField.value ?? ''}
          onChange={(e) => rhfField.onChange(Number(e.target.value))}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          placeholder={fieldConfig.placeholder}
          value={rhfField.value ?? ''}
          onChange={(e) => rhfField.onChange(e.target.value)}
        />
      );

    default:
      return (
        <Input
          type="text"
          placeholder={fieldConfig.placeholder}
          value={rhfField.value ?? ''}
          onChange={(e) => rhfField.onChange(e.target.value)}
        />
      );
  }
};

export default RenderField;
