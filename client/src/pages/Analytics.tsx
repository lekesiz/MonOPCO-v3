import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, FileText, Mail, FolderOpen, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { toast } from 'sonner';

type TimeRange = '7d' | '30d' | '3m' | '1y' | 'all';

type Stats = {
  totalDossiers: number;
  totalDocuments: number;
  totalEmails: number;
  dossiersThisMonth: number;
  documentsThisMonth: number;
  emailsThisMonth: number;
};

type ChartData = {
  date: string;
  dossiers: number;
  documents: number;
  emails: number;
};

type StatusData = {
  name: string;
  value: number;
  color: string;
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [stats, setStats] = useState<Stats>({
    totalDossiers: 0,
    totalDocuments: 0,
    totalEmails: 0,
    dossiersThisMonth: 0,
    documentsThisMonth: 0,
    emailsThisMonth: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate.setFullYear(2020, 0, 1); // Arbitrary old date
          break;
      }

      // Fetch dossiers
      const { data: dossiers, error: dossiersError } = await supabase
        .from('dossiers')
        .select('id, created_at, statut')
        .gte('created_at', startDate.toISOString());

      if (dossiersError) throw dossiersError;

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString());

      if (documentsError) throw documentsError;

      // Fetch emails
      const { data: emails, error: emailsError } = await supabase
        .from('emails')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString());

      if (emailsError) throw emailsError;

      // Calculate stats
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      setStats({
        totalDossiers: dossiers?.length || 0,
        totalDocuments: documents?.length || 0,
        totalEmails: emails?.length || 0,
        dossiersThisMonth: dossiers?.filter(d => new Date(d.created_at) >= thisMonthStart).length || 0,
        documentsThisMonth: documents?.filter(d => new Date(d.created_at) >= thisMonthStart).length || 0,
        emailsThisMonth: emails?.filter(e => new Date(e.created_at) >= thisMonthStart).length || 0,
      });

      // Prepare chart data (group by day/week/month based on range)
      const groupedData = groupDataByPeriod(dossiers || [], documents || [], emails || [], timeRange);
      setChartData(groupedData);

      // Prepare status distribution
      const statusCounts: Record<string, number> = {};
      dossiers?.forEach(d => {
        const status = d.statut || 'Non défini';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusArray: StatusData[] = Object.entries(statusCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));
      setStatusData(statusArray);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const groupDataByPeriod = (
    dossiers: any[],
    documents: any[],
    emails: any[],
    range: TimeRange
  ): ChartData[] => {
    const data: Record<string, { dossiers: number; documents: number; emails: number }> = {};

    const formatDate = (date: Date) => {
      if (range === '7d' || range === '30d') {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      } else if (range === '3m') {
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      } else {
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      }
    };

    const addToData = (items: any[], key: 'dossiers' | 'documents' | 'emails') => {
      items.forEach(item => {
        const date = formatDate(new Date(item.created_at));
        if (!data[date]) {
          data[date] = { dossiers: 0, documents: 0, emails: 0 };
        }
        data[date][key]++;
      });
    };

    addToData(dossiers, 'dossiers');
    addToData(documents, 'documents');
    addToData(emails, 'emails');

    return Object.entries(data)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Tableau de Bord Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualisez l'évolution de votre activité et vos statistiques
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="3m">3 derniers mois</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDossiers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.dossiersThisMonth} ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.documentsThisMonth} ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.emailsThisMonth} ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'Activité</CardTitle>
              <CardDescription>
                Nombre de dossiers, documents et emails créés au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="dossiers"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    name="Dossiers"
                  />
                  <Area
                    type="monotone"
                    dataKey="documents"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    name="Documents"
                  />
                  <Area
                    type="monotone"
                    dataKey="emails"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                    name="Emails"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison par Type</CardTitle>
              <CardDescription>
                Comparez le volume de dossiers, documents et emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="dossiers" fill="#6366f1" name="Dossiers" />
                  <Bar dataKey="documents" fill="#8b5cf6" name="Documents" />
                  <Bar dataKey="emails" fill="#ec4899" name="Emails" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution par Statut</CardTitle>
                <CardDescription>
                  Répartition des dossiers par statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.value})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances</CardTitle>
                <CardDescription>
                  Analyse des tendances d'activité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Dossiers</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.dossiersThisMonth > 0 ? '+' : ''}{stats.dossiersThisMonth} ce mois
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Documents</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.documentsThisMonth > 0 ? '+' : ''}{stats.documentsThisMonth} ce mois
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Emails</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.emailsThisMonth > 0 ? '+' : ''}{stats.emailsThisMonth} ce mois
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
