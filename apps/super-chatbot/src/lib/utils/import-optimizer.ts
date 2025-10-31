/**
 * Утилита для оптимизации импортов из @turbo-super/ui
 * Объединяет множественные импорты в один для уменьшения bundle size
 */

// Re-export commonly used UI components
export {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@turbo-super/ui';

// Re-export commonly used icons
export {
  BotIcon,
  UserIcon,
  AttachmentIcon,
  VercelIcon,
  GitIcon,
  BoxIcon,
  HomeIcon,
  GPSIcon,
  InvoiceIcon,
  RouteIcon,
  FileIcon,
  LoaderIcon,
  UploadIcon,
  MenuIcon,
  PencilEditIcon,
  MoreIcon,
  TrashIcon,
  InfoIcon,
  ArrowUpIcon,
} from '@/components/common/icons';
