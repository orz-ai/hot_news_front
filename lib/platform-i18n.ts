import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PLATFORMS, PlatformDefinition, PlatformCategoryKey, PlatformUpdateFrequencyKey } from '@/constants/platforms';
import { PlatformInfo, PlatformType } from '@/types';

export function usePlatformI18n() {
  const t = useTranslations('platforms');

  const getPlatformName = (code: PlatformType) => t(`${code}.name`);
  const getPlatformShortName = (code: PlatformType) => t(`${code}.shortName`);
  const getPlatformDescription = (code: PlatformType) => t(`${code}.description`);
  const getPlatformCategory = (key: PlatformCategoryKey) => t(`categories.${key}`);
  const getPlatformUpdateFrequency = (key: PlatformUpdateFrequencyKey) => t(`updateFrequencies.${key}`);

  const resolvePlatformInfo = (platform: PlatformDefinition): PlatformInfo => ({
    code: platform.code,
    name: getPlatformName(platform.code),
    description: getPlatformDescription(platform.code),
    contentType: platform.contentTypeKeys.map(getPlatformCategory),
    updateFrequency: getPlatformUpdateFrequency(platform.updateFrequencyKey),
    color: platform.color,
    icon: platform.icon,
  });

  const getPlatformInfoByCode = (code: string): PlatformInfo | undefined => {
    const platform = PLATFORMS.find((item) => item.code === code);
    return platform ? resolvePlatformInfo(platform) : undefined;
  };

  const translatedPlatforms = useMemo(() => PLATFORMS.map(resolvePlatformInfo), [t]);

  return {
    translatedPlatforms,
    getPlatformName,
    getPlatformShortName,
    getPlatformDescription,
    getPlatformCategory,
    getPlatformUpdateFrequency,
    getPlatformInfoByCode,
    resolvePlatformInfo,
  };
}
