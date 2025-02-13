import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AlertProps {
  title: string
  message: string
  isOpen: boolean
  onClose: () => void
}

export function Alert({ title, message, isOpen, onClose }: AlertProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>确定</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

