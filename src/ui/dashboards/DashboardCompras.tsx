'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, BarChart, PieChart } from '../components';
import { useSnackbar } from 'notistack';
import { ServerResponseType } from '@/store';
import { dashboardDataType, dashboardTableType } from '@/types';
import { generatePastelColors } from '@/functions';
import {
  getComprasDashboard,
  getComprasTableDashboard,
} from '@/backend/reportes';
import { useLoadingOverlayContext } from '@/context';

export type DashboardComprasProps = {};

const DashboardCompras: React.FC<DashboardComprasProps> = ({}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { showLoading, hideLoading } = useLoadingOverlayContext();

  const [byDate, setByDate] = useState<dashboardDataType[]>([]);

  const [byBranch, setByBranch] = useState<dashboardDataType[]>([]);

  const [byGroup, setByGroup] = useState<dashboardDataType[]>([]);

  const [byStates, setByStates] = useState<dashboardDataType[]>([]);

  const [byLastMonth, setLastMonth] = useState<dashboardDataType[]>([]);

  const [table, setTable] = useState<dashboardTableType[]>([]);

  const [barChartColors, setBarChartColors] = useState<string[]>([]);

  const [pieChartColors, setPieChartColors] = useState<string[]>([]);

  const [barChartColors2, setBarChartColors2] = useState<string[]>([]);

  const fetchData = async () => {
    showLoading();
    try {
      const response: ServerResponseType | undefined =
        await getComprasDashboard();

      const responseTable: ServerResponseType | undefined =
        await getComprasTableDashboard();

      if (response && responseTable) {
        if (response.status === 200) {
          setByDate(response.message.body[0].t1);
          setByBranch(response.message.body[0].t2);
          setByGroup(response.message.body[0].t3);
          setByStates(response.message.body[0].t4);
          setLastMonth(response.message.body[0].t5);
          setTable(responseTable.message);
        } 
      }
      hideLoading();
    } catch (error) {
      hideLoading();
      enqueueSnackbar('Existió un error para obtener el dashboard', {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setBarChartColors(generatePastelColors(byBranch));
  }, [byBranch]);

  useEffect(() => {
    setPieChartColors(generatePastelColors(byGroup));
  }, [byGroup]);

  useEffect(() => {
    setBarChartColors2(generatePastelColors(byStates));
  }, [byStates]);

  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-graph3" />
                <h3>SEGUIMIENTO ORDENES DE COMPRA</h3>
              </div>
            </header>
            <div className="widget__content filled">
              <BarChart
                label="N° Ordenes "
                labels={byStates.map((item) => item.labels)}
                data={byStates.map((item) => item.values)}
                backgroundColor={barChartColors2}
                borderColor={barChartColors2}
              />
            </div>
          </article>
          {/* Chart */}
        </div>

        <div className="col-md-6">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-graph3" />
                <h3>ADQUISICIONES POR GRUPOS DE INV.</h3>
              </div>
            </header>
            <div className="widget__content filled">
              <PieChart
                label="Valor Grupo $"
                labels={byGroup.map((item) => item.labels)}
                data={byGroup.map((item) => item.values)}
                backgroundColor={pieChartColors}
              />
            </div>
          </article>
          {/* Chart */}
        </div>
      </div>
      {/* AREA CHART 1  */}
      <div className="row">
        <div className="col-md-12">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-graph3" />
                <h3>ADQUISICIONES GLOBALES</h3>
              </div>
            </header>
            <div className="widget__content filled">
              <AreaChart
                data={byDate.map((item) => item.values)}
                label="Valor Ordenes $"
                labels={byDate.map((item) => item.labels)}
                backgroundColor="rgba(75, 192, 192, 0.2)"
                borderColor="rgba(75, 192, 192, 1)"
              />
            </div>
          </article>
          {/* /widget */}
        </div>
      </div>
      {/* BAR CHART 1  */}
      <div className="row">
        <div className="col-md-12">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-graph3" />
                <h3>ADQUISICIONES POR SUCURSAL</h3>
              </div>
            </header>
            <div className="widget__content filled">
              <BarChart
                label="Valor Ordenes $"
                labels={byBranch.map((item) => item.labels)}
                data={byBranch.map((item) => item.values)}
                backgroundColor={barChartColors}
                borderColor={barChartColors}
              />
            </div>
          </article>
          {/* /widget */}
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-graph3" />
                <h3>ADQUISICIONES MENSUALES</h3>
              </div>
            </header>
            <div className="widget__content filled">
              <AreaChart
                data={byLastMonth.map((item) => item.values)}
                label="Valor Ordenes $"
                labels={byLastMonth.map((item) => item.labels)}
                backgroundColor="rgba(222, 220, 106, 0.2)"
                borderColor="rgba(222, 220, 106, 1)"
              />
            </div>
          </article>
          {/* /widget */}
        </div>
      </div>
      {/* /row */}
      <div className="row">
        <div className="col-md-12">
          <article className="widget">
            <header className="widget__header">
              <div className="widget__title">
                <i className="pe-7f-menu" />
                <h3>ESTADO DE SOLICITUDES DE COMPRA POR SUCURSAL</h3>
              </div>
            </header>
            <div className="widget__content table-responsive">
              <table className="table table-striped media-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Sucursal</th>
                    <th style={{ width: '100px' }}>En Edición</th>
                    <th style={{ width: '100px' }}>Enviadas</th>
                    <th style={{ width: '100px' }}>Aprobadas</th>
                    <th style={{ width: '100px' }}>Negadas</th>
                    <th style={{ width: '100px' }}>Anuladas</th>
                    <th style={{ width: '100px' }}>Gestionadas Parcial</th>
                    <th style={{ width: '100px' }}>Gestionadas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="spacer" />
                  {table.map((item) => (
                    <tr
                      key={item.branch}
                      style={{ backgroundColor: 'inherit' }}
                    >
                      <td>
                        <div className="media">
                          <div className="media-body post_desc">
                            <h3> {item.branch}</h3>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'left' }}>{item.edition}</td>
                      <td style={{ textAlign: 'left' }}>{item.sent}</td>
                      <td style={{ textAlign: 'left' }}>{item.approved}</td>
                      <td style={{ textAlign: 'left' }}>{item.negated}</td>
                      <td style={{ textAlign: 'left' }}>{item.anulated}</td>
                      <td style={{ textAlign: 'left' }}>{item.partial}</td>
                      <td style={{ textAlign: 'left' }}>{item.managed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* /widget__content */}
          </article>
          {/* /widget */}
        </div>
      </div>
    </>
  );
};

export default DashboardCompras;
