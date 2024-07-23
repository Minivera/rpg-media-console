import { Fragment } from 'react';
import { Flex, IconButton, Separator, Text } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Link, useLocation } from 'wouter';

export const Navigation = ({ previousPage, breadcrumbs, ...rest }) => {
  const [, setLocation] = useLocation();

  return (
    <Flex gap="2" direction="row" align="center" {...rest}>
      <IconButton
        size="1"
        variant="ghost"
        onClick={() => setLocation(previousPage)}
        style={{ cursor: 'pointer' }}
      >
        <ArrowLeftIcon height="16" width="16" />
      </IconButton>
      {breadcrumbs.map(({ path, active, name }, index) => (
        <Fragment key={index}>
          {index > 0 && <Separator orientation="vertical" />}
          {path ? (
            <Text size="1" style={{ textDecoration: 'none' }}>
              <Link to={path}>{name}</Link>
            </Text>
          ) : (
            <Text size="1" color={active ? 'orange' : 'gray'}>
              {name}
            </Text>
          )}
        </Fragment>
      ))}
    </Flex>
  );
};
