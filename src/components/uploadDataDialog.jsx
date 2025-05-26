import { useEffect, useState } from 'react';
import { Button, Dialog, Flex, TextArea } from '@radix-ui/themes';
import {
  onExportStateAsJSON,
  onImportJSONState,
} from '../backend/state.telefunc.js';

export const UploadDataDialog = () => {
  const [opened, setOpened] = useState(false);
  const [jsonData, setJsonData] = useState('');

  const handleKeyDown = event => {
    if (event.key === 'u' && event.ctrlKey) {
      event.preventDefault();
      setOpened(true);
    }

    // Also allow a secret export to the old JSON format with CTRL+e
    if (event.key === 'e' && event.ctrlKey) {
      event.preventDefault();
      onExportStateAsJSON().then(data => {
        const a = document.createElement('a');
        const file = new Blob([data], {
          type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'export_db.json';
        a.click();
      });
    }
  };

  const handleSaveData = event => {
    event.preventDefault();
    onImportJSONState(jsonData).then(() => {
      window.location.reload();
    });
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Dialog.Root open={opened} onOpenChange={setOpened}>
      <Dialog.Content size="4">
        <Dialog.Title>Upload the db.json File</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Please make sure this is valid JSON, we won't do any validation on the
          data. You might destroy your database! Uploading the data will reload
          the page
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <TextArea
            placeholder="Copy your JSON here..."
            rows={10}
            resize="vertical"
            value={jsonData}
            onChange={event => setJsonData(event.target.value)}
          />
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleSaveData} color="red">
              Upload
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
