import { ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AiClient } from '../client';
import { Course, CourseMaterial, QuizPlan } from '../types';
import { formatBytes } from '../utils';

interface MaterialsPanelProps {
  client: AiClient;
  conversationId: number | null;
  plan: QuizPlan;
  courseId: number | null;
  courses: Course[];
  coursesLoading: boolean;
  coursesError: boolean;
  courseSelectionPending: boolean;
  onPlanPatch: (patch: Partial<QuizPlan>) => void;
  onCourseSelect: (courseId: number) => void;
  onRetryCourses: () => void;
  onOpenCourses: () => void;
  onOpenPaste: () => void;
  onToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export function MaterialsPanel({
  client,
  conversationId,
  plan,
  courseId,
  courses,
  coursesLoading,
  coursesError,
  courseSelectionPending,
  onPlanPatch,
  onCourseSelect,
  onRetryCourses,
  onOpenCourses,
  onOpenPaste,
  onToast
}: MaterialsPanelProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const materialsQuery = useQuery({
    queryKey: ['ai', 'materials', courseId],
    queryFn: () => client.listMaterials(courseId as number),
    enabled: Boolean(courseId)
  });
  const materials = materialsQuery.data || [];

  const uploadMutation = useMutation({
    mutationFn: ({ selectedCourseId, file }: { selectedCourseId: number; file: File }) =>
      client.uploadMaterial(selectedCourseId, file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'materials', courseId] }),
        conversationId
          ? queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] })
          : Promise.resolve()
      ]);
      onToast('Course material indexed.', 'success');
    },
    onError: error => onToast(error instanceof Error ? error.message : 'Material upload failed.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: ({ selectedCourseId, materialId }: { selectedCourseId: number; materialId: number }) =>
      client.deleteMaterial(selectedCourseId, materialId),
    onSuccess: async (_, variables) => {
      onPlanPatch({ materialIds: plan.materialIds.filter(id => id !== variables.materialId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['ai', 'materials', courseId] }),
        conversationId
          ? queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', conversationId] })
          : Promise.resolve()
      ]);
      onToast('Material removed.', 'success');
    },
    onError: error => onToast(error instanceof Error ? error.message : 'Could not remove material.', 'error')
  });

  const visibleMaterials = useMemo(() => {
    const needle = filter.trim().toLocaleLowerCase();
    return materials.filter(material => !needle || material.originalName.toLocaleLowerCase().includes(needle));
  }, [filter, materials]);

  const uploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !courseId) return;
    uploadMutation.mutate({ selectedCourseId: courseId, file });
  };

  const toggleMaterial = (material: CourseMaterial) => {
    if (!conversationId) {
      onToast('Start a conversation before selecting source material.', 'info');
      return;
    }
    const selected = plan.materialIds.includes(material.id);
    onPlanPatch({
      materialIds: selected
        ? plan.materialIds.filter(id => id !== material.id)
        : [...plan.materialIds, material.id]
    });
  };

  return (
    <section className="aiw-sidebar__section aiw-materials" aria-labelledby="aiw-materials-heading">
      <div className="aiw-section-heading">
        <div>
          <h2 id="aiw-materials-heading">Course materials</h2>
          <small>{courseId ? `${materials.length} indexed` : 'Choose a course first'}</small>
        </div>
      </div>
      {!courseId ? (
        <div className="aiw-material-course">
          {coursesLoading ? (
            <p className="aiw-muted" role="status">Loading courses…</p>
          ) : coursesError ? (
            <div className="aiw-inline-error" role="alert">
              <span>Courses could not be loaded.</span>
              <button type="button" onClick={onRetryCourses}>Retry</button>
            </div>
          ) : courses.length ? (
            <label className="aiw-field">
              <span>Course for materials</span>
              <select
                aria-label="Course for materials"
                value=""
                disabled={courseSelectionPending}
                onChange={event => {
                  const selectedCourseId = Number(event.target.value);
                  if (selectedCourseId) onCourseSelect(selectedCourseId);
                }}
              >
                <option value="">
                  {courseSelectionPending ? 'Starting workspace…' : 'Select a course'}
                </option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
                ))}
              </select>
            </label>
          ) : (
            <button
              className="aiw-button aiw-button--quiet aiw-button--small aiw-button--full"
              type="button"
              onClick={onOpenCourses}
            >
              Open Courses
            </button>
          )}
        </div>
      ) : null}
      <div className="aiw-material-actions">
        <label className={`aiw-button aiw-button--quiet aiw-button--small ${!courseId || courseSelectionPending ? 'is-disabled' : ''}`}>
          <span aria-hidden="true">↑</span>
          {uploadMutation.isPending ? 'Indexing…' : 'Upload'}
          <input
            id="aiw-material-upload"
            className="aiw-sr-only"
            type="file"
            accept=".pdf,.txt,.md,.docx"
            onChange={uploadFile}
            disabled={!courseId || courseSelectionPending || uploadMutation.isPending}
          />
        </label>
        <button
          className="aiw-button aiw-button--quiet aiw-button--small"
          type="button"
          onClick={onOpenPaste}
          disabled={!courseId || courseSelectionPending}
        >
          Paste notes
        </button>
      </div>
      {materials.length > 4 ? (
        <label className="aiw-search aiw-search--small">
          <span className="aiw-sr-only">Filter course materials</span>
          <span aria-hidden="true">⌕</span>
          <input value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter materials" />
        </label>
      ) : null}
      {materialsQuery.isLoading ? <p className="aiw-muted" role="status">Loading materials…</p> : null}
      {materialsQuery.isError ? (
        <div className="aiw-inline-error" role="alert">
          <span>Materials could not be loaded.</span>
          <button type="button" onClick={() => materialsQuery.refetch()}>Retry</button>
        </div>
      ) : null}
      <div className="aiw-material-list">
        {courseId && !materialsQuery.isLoading && !visibleMaterials.length ? (
          <p className="aiw-muted">No indexed material for this course.</p>
        ) : null}
        {visibleMaterials.map(material => (
          <div className="aiw-material" key={material.id}>
            <label>
              <input
                type="checkbox"
                checked={plan.materialIds.includes(material.id)}
                onChange={() => toggleMaterial(material)}
                disabled={material.status === 'failed'}
              />
              <span>
                <strong>{material.originalName}</strong>
                <small>
                  {material.status === 'failed'
                    ? material.errorMessage || 'Indexing failed'
                    : `${material.chunkCount} chunks${material.byteSize ? ` · ${formatBytes(material.byteSize)}` : ''}`}
                </small>
              </span>
            </label>
            <button
              className="aiw-icon-button aiw-icon-button--small"
              type="button"
              aria-label={`Remove ${material.originalName}`}
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (courseId && window.confirm(`Remove “${material.originalName}” and its indexed chunks?`)) {
                  deleteMutation.mutate({ selectedCourseId: courseId, materialId: material.id });
                }
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
