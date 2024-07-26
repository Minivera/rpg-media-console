import { Text } from '@radix-ui/themes';

export const Duration = ({ seconds }) => {
  const format = seconds => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
  };

  const pad = string => ('0' + string).slice(-2);

  return (
    <Text as="time" dateTime={`P${Math.round(seconds)}S`} size="1" color="gray">
      {format(seconds)}
    </Text>
  );
};
