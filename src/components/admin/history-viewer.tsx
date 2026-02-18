"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, Trash2, Calendar, Edit, ShieldAlert, Palette, Settings } from 'lucide-react';
import { getHistory, clearHistory, HISTORY_KEY_PREFIX } from '@/lib/history';
import { HistoryLog } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HistoryViewerProps {
    schoolId: string;
}

const getActionIcon = (action: string) => {
    if (action.includes('განცხადებ')) return <Edit className="h-4 w-4 text-blue-500" />;
    if (action.includes('განრიგ')) return <Calendar className="h-4 w-4 text-green-500" />;
    if (action.includes('საგანგებო')) return <ShieldAlert className="h-4 w-4 text-red-500" />;
    if (action.includes('გარეგნობა')) return <Palette className="h-4 w-4 text-purple-500" />;
    if (action.includes('პარამეტრები')) return <Settings className="h-4 w-4 text-gray-700" />;
    return <History className="h-4 w-4 text-gray-500" />;
}

export function HistoryViewer({ schoolId }: HistoryViewerProps) {
    const [history, setHistory] = useState<HistoryLog[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const loadHistory = () => {
            setHistory(getHistory(schoolId));
        }
        loadHistory();

        const storageKey = `${HISTORY_KEY_PREFIX}${schoolId}`;
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === storageKey || event.key?.startsWith('announcements-') || event.key?.startsWith('schedule-')) {
                loadHistory();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [schoolId]);

    const handleClearHistory = () => {
        clearHistory(schoolId);
        toast({ title: "ისტორია გასუფთავდა" });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> ცვლილებების ისტორია</CardTitle>
                    <CardDescription>განხორციელებული ცვლილებების სრული ჩანაწერი.</CardDescription>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={history.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ისტორიის გასუფთავება
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ეს ქმედება სამუდამოდ წაშლის ცვლილებების მთელ ისტორიას. ამ მონაცემების აღდგენა შეუძლებელი იქნება.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory}>წაშლა</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
                {history.length > 0 ? (
                    <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                        {history.map(log => (
                            <li key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                                <div className="mt-1 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-muted">
                                    {getActionIcon(log.action)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium">{log.action}</p>
                                    <p className="text-sm text-muted-foreground">{log.details}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1" title={format(new Date(log.timestamp), 'PPpp', { locale: ka })}>
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ka })}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-center py-8">ცვლილებების ისტორია ცარიელია.</p>
                )}
            </CardContent>
        </Card>
    );
}
