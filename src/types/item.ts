/**
 * Represents the available item categories.
 */
export type ItemCategory = "Task" | "Link" | "Item";

/**
 * Represents the shared fields for any Item type.
 */
export interface BaseItemProps {
  id: string;
  title: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Represents category-specific Item properties.
 */
export type ItemProps =
  | (BaseItemProps & {
      category: "Task";
      isChecked: boolean;
      onCheckedChange: (checked: boolean) => void;
      deadline: string;
    })
  | (BaseItemProps & {
      category: "Link";
      url: string;
      createdAt: string;
    })
  | (BaseItemProps & {
      category: "Item";
      createdAt: string;
    });
