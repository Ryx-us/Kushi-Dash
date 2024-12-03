import React, { useCallback } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import AdminAuthLayer from '@/Layouts/AdminAuthLayer'
import { useToast } from "@/hooks/use-toast"
import { useDropzone } from 'react-dropzone'
import { CircularProgress } from '@/components/circular-progress'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Eye, Upload } from 'lucide-react'

export default function CDN() {
    const { files, maxSize, storage } = usePage().props
    const { flash } = usePage().props
    const { toast } = useToast()
    
    const { data, setData, post, progress, processing, reset } = useForm({
        file: null,
    })

    React.useEffect(() => {
        if (flash.success) {
            toast({
                title: "Success",
                description: flash.success,
            })
        }
        if (flash.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive"
            })
        }
    }, [flash, toast])

    const handleSubmit = (e) => {
        e.preventDefault()
        post(route('cdn.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('file')
            },
        })
    }

    const handleDelete = (filename) => {
        if (confirm('Are you sure you want to delete this file?')) {
            router.delete(route('cdn.destroy', filename), {
                preserveScroll: true,
            })
        }
    }

    const onDrop = useCallback((acceptedFiles) => {
        setData('file', acceptedFiles[0])
    }, [setData])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const handleDoubleClick = (url) => {
        window.open(url, '_blank')
    }

    return (
        (<AdminAuthLayer
            header={
                <h2
                    className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Home / Admin / CDN
                </h2>
            }
            sidebartab="cdn">
            <Head title="CDN Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p><strong>Used:</strong> {storage.usedMB} MB</p>
                                    <p><strong>Free:</strong> {storage.freeMB} MB</p>
                                    <p><strong>Total:</strong> {storage.totalMB} MB</p>
                                </div>
                                <CircularProgress progress={storage.percentUsed} size={100} strokeWidth={10} />
                            </div>
                            <Progress value={storage.percentUsed} className="w-full" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>CDN Upload</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                                        isDragActive ? 'border-primary' : 'border-muted-foreground'
                                    }`}>
                                    <input {...getInputProps()} />
                                    {isDragActive ? (
                                        <p>Drop the files here ...</p>
                                    ) : (
                                        <div>
                                            <Upload className="mx-auto mb-4" />
                                            <p>Drag 'n' drop a file here, or click to select a file</p>
                                        </div>
                                    )}
                                </div>
                                {data.file && <p className="mt-2">Selected file: {data.file.name}</p>}
                                <Button type="submit" disabled={processing || !data.file} className="mt-4">
                                    {processing ? 'Uploading...' : 'Upload'}
                                </Button>
                                
                                {progress && (
                                    <div className="mt-4 flex justify-center">
                                        
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Uploaded Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map((file) => (
                                        <TableRow key={file.name} onDoubleClick={() => handleDoubleClick(file.url)}>
                                            <TableCell>{file.name}</TableCell>
                                            <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => window.open(file.url, '_blank')}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(file.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AdminAuthLayer>)
    );
}

