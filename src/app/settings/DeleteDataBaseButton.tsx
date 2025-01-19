import { useDeleteEventsMutation } from '@api/db/events/useDeleteEventsMutation';
import { Stack } from '@components/Stack/Stack';
import { Button } from '@nextui-org/react';
import { GrTrash } from 'react-icons/gr';

const DeleteDataBaseButton = () => {
  const { mutate } = useDeleteEventsMutation({
    onSuccess: () => {
      alert('Baza danych wyczyszczona');
    },
    onError: (error) => {
      console.error(error);
      alert('Błąd podczas usuwania bazy');
    },
  });

  const handleDeleteDataBase = () => {
    void mutate();
  };

  return (
    <Stack gap={16}>
      <div>
        <Button onClick={(event) => handleDeleteDataBase()}>
          Usuń bazę danych
          <GrTrash size={24} />
        </Button>
      </div>
    </Stack>
  );
};

export default DeleteDataBaseButton;
