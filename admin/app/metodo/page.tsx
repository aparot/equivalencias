"use client";

import { useMemo, useState } from "react";
import {
  equivalenceAssumptions,
  materialFactors,
  methodMetadata,
  mixedMaterials,
  notes,
  overviewParagraphs,
  references,
  scenarioList,
  unitConversions,
} from "./methodData";

export const dynamic = "force-dynamic";

function renderSourceLabel(source: string) {
  if (!source) return "-";
  if (source.startsWith("http")) {
    return (
      <a className="link" href={source} target="_blank" rel="noreferrer">
        {source}
      </a>
    );
  }
  return source;
}

export default function MetodoPage() {
  const [materialQuery, setMaterialQuery] = useState("");
  const [unitQuery, setUnitQuery] = useState("");

  const filteredMaterials = useMemo(() => {
    const query = materialQuery.trim().toLowerCase();
    if (!query) return materialFactors;
    return materialFactors.filter((row) => {
      const fields = [row.material, row.note, row.netReduction].filter(Boolean).join(" ").toLowerCase();
      return fields.includes(query);
    });
  }, [materialQuery]);

  const filteredConversions = useMemo(() => {
    const query = unitQuery.trim().toLowerCase();
    if (!query) return unitConversions;
    return unitConversions.filter((row) => {
      const fields = [row.energy, row.from, row.to, row.factor, row.source].filter(Boolean).join(" ").toLowerCase();
      return fields.includes(query);
    });
  }, [unitQuery]);

  return (
    <main className="portal-root method-root">
      <header className="portal-header method-header">
        <div>
          <p className="eyebrow">EcoEquivalencias</p>
          <h1>Método y parámetros</h1>
          <p className="muted">
            {methodMetadata.title} · {methodMetadata.subtitle} · Versión {methodMetadata.version} ({methodMetadata.updatedAt})
          </p>
        </div>
        <div className="portal-header__actions">
          <a className="btn ghost" href="/">
            Volver a la calculadora
          </a>
        </div>
      </header>

      <section className="portal-card method-section">
        <h2>Resumen metodológico</h2>
        {overviewParagraphs.map((paragraph) => (
          <p key={paragraph} className="method-paragraph">
            {paragraph} <sup className="cite">[WB]</sup>
          </p>
        ))}
        <p className="method-paragraph">
          Los factores de emisiones provienen del modelo WARM (Waste Reduction Model) de la EPA. <sup className="cite">[WARM]</sup>
        </p>
        <p className="method-paragraph">
          {notes.factorUnit} <sup className="cite">[WB]</sup>
        </p>
      </section>

      <section className="portal-card method-section">
        <h2>Escenarios considerados</h2>
        <ul className="method-list">
          {scenarioList.map((item) => (
            <li key={item}>{item} <sup className="cite">[WB]</sup></li>
          ))}
        </ul>
      </section>

      <section className="portal-card method-section">
        <h2>Materiales mezclados y proporciones</h2>
        <ul className="method-list">
          {mixedMaterials.map((item) => (
            <li key={item.label}>
              <strong>{item.label}:</strong> {item.composition} <sup className="cite">[WB]</sup>
            </li>
          ))}
        </ul>
      </section>

      <section className="portal-card method-section">
        <h2>Supuestos de ecoequivalencias</h2>
        <p className="method-paragraph">{notes.rounding} <sup className="cite">[WB]</sup></p>
        <div className="method-grid">
          {equivalenceAssumptions.map((assumption) => (
            <article className="method-card" key={assumption.item}>
              <div className="method-card__header">
                <h3>{assumption.item}</h3>
                <p className="method-meta">
                  Factor: <strong>{assumption.factor}</strong> · {assumption.unit}
                </p>
              </div>
              <details className="method-details">
                <summary>Ver explicación y cálculo</summary>
                <p className="method-paragraph prewrap">{assumption.explanation}</p>
                <p className="method-paragraph prewrap">{assumption.calc}</p>
              </details>
              <p className="method-meta">
                Fuente: {renderSourceLabel(assumption.source)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-card method-section">
        <h2>Factores por material (WARM v15)</h2>
        <p className="method-paragraph">
          {notes.tetrapak} <sup className="cite">[WB]</sup>
        </p>
        <p className="method-paragraph">
          Fuente principal de factores: WARM v15 (EPA). <sup className="cite">[WARM]</sup>
        </p>
        <label className="field method-search">
          Buscar material o nota
          <input
            className="input"
            value={materialQuery}
            onChange={(event) => setMaterialQuery(event.target.value)}
            placeholder="Ej: PET, aluminio, neta..."
          />
        </label>
        <div className="table-wrap method-table">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Producido</th>
                <th>Reducido</th>
                <th>Reciclado</th>
                <th>Relleno</th>
                <th>Incinerado</th>
                <th>Compostado</th>
                <th>Digerido</th>
                <th>Reducción neta</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((row) => (
                <tr key={row.material}>
                  <td>{row.material}</td>
                  <td>{row.produced ?? "NA"}</td>
                  <td>{row.reduced ?? "NA"}</td>
                  <td>{row.recycled ?? "NA"}</td>
                  <td>{row.landfill ?? "NA"}</td>
                  <td>{row.incinerated ?? "NA"}</td>
                  <td>{row.composted ?? "NA"}</td>
                  <td>{row.digested ?? "NA"}</td>
                  <td>{row.netReduction ?? "NA"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="portal-card method-section">
        <h2>Conversión de unidades</h2>
        <p className="method-paragraph">Factores de conversión usados en la calculadora para energía y combustibles.</p>
        <label className="field method-search">
          Buscar conversión
          <input
            className="input"
            value={unitQuery}
            onChange={(event) => setUnitQuery(event.target.value)}
            placeholder="Ej: kWh, GJ, gas natural..."
          />
        </label>
        <div className="table-wrap method-table">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Desde</th>
                <th>Hacia</th>
                <th>Factor</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversions.map((row, index) => (
                <tr key={`${row.energy}-${row.from}-${row.to}-${index}`}>
                  <td>{row.energy}</td>
                  <td>{row.from}</td>
                  <td>{row.to}</td>
                  <td>{row.factor}</td>
                  <td>{renderSourceLabel(row.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="portal-card method-section">
        <h2>Referencias</h2>
        <ul className="method-list">
          {references.map((ref) => (
            <li key={ref.id}>
              <strong>[{ref.id}]</strong> {ref.url ? (
                <a className="link" href={ref.url} target="_blank" rel="noreferrer">
                  {ref.label}
                </a>
              ) : (
                ref.label
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
