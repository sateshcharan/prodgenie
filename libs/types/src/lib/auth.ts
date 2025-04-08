export type AuthFormField = {
    name: string;
    label: string;
    type: string;
    validation?: Record<string, unknown>;
  };
  
  export type AuthFormProps = {
    fields: AuthFormField[];
    onSubmit: (data: Record<string, any>) => void;
    buttonLabel: string;
    className?: string;
  };
  
  