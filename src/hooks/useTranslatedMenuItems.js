import { useTranslations } from 'next-intl';
import { homePageItems, otherPagesMenuItem } from '@/data/menuItems';

export const useTranslatedMenuItems = (isHomePage) => {
  const t = useTranslations();

  const translateMenuItem = (item) => ({
    ...item,
    menuItem: t(item.menuItem),
    submenuItems: item.submenuItems?.map(subitem => ({
      ...subitem,
      menuItem: t(subitem.menuItem)
    })) || []
  });

  const menuItems = isHomePage ? homePageItems : otherPagesMenuItem;
  return menuItems.map(translateMenuItem);
};