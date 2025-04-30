import React from 'react';

type Props = { [key: string]: any };

export function mergeTemplates(
  components: React.ComponentType<Props>[],
  props: Props
): React.FC {
  return (
    <>
      {components.map((Component, idx) => (
        <Component key={idx} {...props} />
      ))}
    </>
  );
}
