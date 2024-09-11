'use client';

import PageContainer from '@components/PageContainer/PageContainer';
import { Stack } from '@components/Stack/Stack';
import { Divider } from '@nextui-org/react';
import { useBreakpoints } from '@utils/useBreakpoints';
import { useMemo } from 'react';

export default function Page() {
  const { isMobile, isTablet, isDesktop, isBigDesktop } = useBreakpoints();

  const sizes = useMemo(() => {
    if (isMobile) {
      return {
        width: '100%',
        height: '200',
      };
    }
    if (isTablet) {
      return {
        width: '100%',
        height: '250',
      };
    }
    if (isDesktop) {
      return {
        width: '530',
        height: '350',
      };
    }
    if (isBigDesktop) {
      return {
        width: '780',
        height: '520',
      };
    }
  }, [isMobile, isTablet, isDesktop, isBigDesktop]);

  return (
    <PageContainer>
      <Stack>
        <div>
          <h3>Opieka Naprzemienna cz. 1 - Dodawanie Opieki</h3>
        </div>
        <iframe
          width={sizes?.width}
          height={sizes?.height}
          src='https://www.youtube.com/embed/videoseries?si=TkhsPGwNKjnH_dWD&amp;list=PLK6fgRO7fX3ljcl4po-cT9Ll1YS9PEYXR'
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>

        <Divider className='my-8' />

        <div>
          <h3>Opieka Naprzemienna cz. 2 - Edytor Wydarzeń</h3>
        </div>
        <iframe
          width={sizes?.width}
          height={sizes?.height}
          src='https://www.youtube.com/embed/vKyApCEKv2A?si=kB0Izk4UAEDvuAvU'
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>

        <Divider className='my-8' />

        <div>
          <h3>Opieka Naprzemienna cz. 3 - Edytor Eventów</h3>
        </div>
        <iframe
          width={sizes?.width}
          height={sizes?.height}
          src='https://www.youtube.com/embed/YS0Pv8mLX6c?si=Ar-6VDu5AXSadQsR'
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>

        <Divider className='my-8' />

        <div>
          <h3>Opieka Naprzemienna cz. 4 - Widok zaawansowany</h3>
        </div>
        <iframe
          width={sizes?.width}
          height={sizes?.height}
          src='https://www.youtube.com/embed/y04-XR4W3lY?si=5vushCGIHBtNyZzC'
          title='YouTube video player'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        ></iframe>
      </Stack>
    </PageContainer>
  );
}
