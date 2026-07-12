"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { FileText, AlertTriangle, Calendar, Truck, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const expiringDocuments = [
  {
    id: "doc-001",
    entityType: "VEHICLE",
    entityName: "Van-05",
    documentType: "VEHICLE_INSURANCE",
    expiryDate: "2024-07-20",
    daysUntilExpiry: 8,
    status: "EXPIRING_SOON",
  },
  {
    id: "doc-002",
    entityType: "DRIVER",
    entityName: "John Smith",
    documentType: "DRIVER_LICENSE",
    expiryDate: "2024-07-25",
    daysUntilExpiry: 13,
    status: "EXPIRING_SOON",
  },
  {
    id: "doc-003",
    entityType: "VEHICLE",
    entityName: "Truck-01",
    documentType: "VEHICLE_FITNESS_CERT",
    expiryDate: "2024-07-15",
    daysUntilExpiry: 3,
    status: "EXPIRING_SOON",
  },
  {
    id: "doc-004",
    entityType: "VEHICLE",
    entityName: "Van-02",
    documentType: "VEHICLE_PERMIT",
    expiryDate: "2024-08-10",
    daysUntilExpiry: 29,
    status: "VALID",
  },
  {
    id: "doc-005",
    entityType: "DRIVER",
    entityName: "Mike Johnson",
    documentType: "DRIVER_LICENSE",
    expiryDate: "2024-07-18",
    daysUntilExpiry: 6,
    status: "EXPIRING_SOON",
  },
];

const documentTypeLabels: Record<string, string> = {
  VEHICLE_INSURANCE: "Insurance",
  VEHICLE_REGISTRATION: "Registration",
  VEHICLE_PERMIT: "Permit",
  VEHICLE_FITNESS_CERT: "Fitness Cert",
  DRIVER_LICENSE: "Driver License",
};

const documentTypeIcons: Record<string, React.ReactNode> = {
  VEHICLE_INSURANCE: <Shield className="h-4 w-4" />,
  VEHICLE_REGISTRATION: <FileText className="h-4 w-4" />,
  VEHICLE_PERMIT: <FileText className="h-4 w-4" />,
  VEHICLE_FITNESS_CERT: <Truck className="h-4 w-4" />,
  DRIVER_LICENSE: <User className="h-4 w-4" />,
};

export function ExpiringDocuments() {
  const sortedDocs = [...expiringDocuments].sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expiring Documents</CardTitle>
        <a href="/documents" className="text-sm text-primary hover:underline">View all</a>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Vehicle / Driver</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {documentTypeIcons[doc.documentType]}
                    <span>{documentTypeLabels[doc.documentType]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {doc.entityType === "VEHICLE" ? (
                      <Truck className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    {doc.entityName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(doc.expiryDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    doc.daysUntilExpiry <= 7
                      ? "bg-red-100 text-red-800"
                      : doc.daysUntilExpiry <= 30
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  )}>
                    {doc.daysUntilExpiry <= 7 && (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {doc.daysUntilExpiry} days
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={doc.status === "EXPIRING_SOON" ? "danger" : "success"}>
                    {doc.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
