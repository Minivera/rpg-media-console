import { Button, AlertDialog, Flex, Text, IconButton } from '@radix-ui/themes';

export const DeleteDialog = ({ type, name, onConfirm, children, asIcon }) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger>
      {asIcon ? (
        <IconButton variant="ghost" style={{ cursor: 'pointer' }} color="red">
          {children}
        </IconButton>
      ) : (
        <Button style={{ cursor: 'pointer' }} color="red">
          {children}
        </Button>
      )}
    </AlertDialog.Trigger>
    <AlertDialog.Content maxWidth="450px">
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description size="2" mb="4">
        Are you sure you want to delete the {type}{' '}
        <Text weight="bold">{name}</Text>
      </AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button variant="solid" color="red" onClick={onConfirm}>
            Delete
          </Button>
        </AlertDialog.Action>
      </Flex>
    </AlertDialog.Content>
  </AlertDialog.Root>
);
