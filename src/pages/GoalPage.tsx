import { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, InputNumber, Modal, Progress, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Goal, GoalStatus, GoalSummary } from '../types/goal';
import { calculateGoalOverview, calculateGoalSummaries, createGoalId } from '../utils/calculateGoal';
import { formatAmount, formatPercent } from '../utils/format';
import { goalRepository } from '../repositories/goalRepository';

const GOAL_STATUS_LABELS: Record<GoalStatus, { text: string; color: string }> = {
  active: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  paused: { text: '暂停', color: 'default' },
};

export default function GoalPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalDraft, setGoalDraft] = useState<Goal | null>(null);
  const goalRows = useMemo(() => calculateGoalSummaries(goals), [goals]);
  const overview = useMemo(() => calculateGoalOverview(goals), [goals]);

  const refreshGoals = async () => {
    setGoals(await goalRepository.getGoals());
  };

  useEffect(() => {
    void refreshGoals();
  }, []);

  const openNewGoal = () => {
    const now = new Date().toISOString();
    setGoalDraft({
      id: createGoalId(),
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      startDate: getToday(),
      targetDate: getDateAfterMonths(12),
      status: 'active',
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  const saveGoal = async () => {
    if (!goalDraft) {
      return;
    }

    const nextGoal = {
      ...goalDraft,
      name: goalDraft.name.trim(),
      targetAmount: Number(goalDraft.targetAmount || 0),
      currentAmount: Number(goalDraft.currentAmount || 0),
    };

    if (!nextGoal.name) {
      message.warning('请填写目标名称');
      return;
    }

    if (nextGoal.targetAmount <= 0) {
      message.warning('目标金额必须大于 0');
      return;
    }

    await goalRepository.saveGoal(nextGoal);
    setGoalDraft(null);
    await refreshGoals();
    message.success('目标已保存');
  };

  const columns: TableColumnsType<GoalSummary> = [
    { title: '目标名称', dataIndex: 'name', key: 'name' },
    { title: '目标金额', dataIndex: 'targetAmount', key: 'targetAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '已完成', dataIndex: 'currentAmount', key: 'currentAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '剩余金额', dataIndex: 'remainingAmount', key: 'remainingAmount', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '完成率',
      dataIndex: 'progressRate',
      key: 'progressRate',
      width: 170,
      render: (value: number) => <Progress percent={Number((value * 100).toFixed(1))} size="small" />,
    },
    { title: '剩余月份', dataIndex: 'remainingMonths', key: 'remainingMonths', align: 'right' },
    { title: '每月需存', dataIndex: 'requiredMonthlySaving', key: 'requiredMonthlySaving', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '目标日期', dataIndex: 'targetDate', key: 'targetDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: GoalStatus) => <Tag color={GOAL_STATUS_LABELS[value].color}>{GOAL_STATUS_LABELS[value].text}</Tag>,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Button type="link" onClick={() => setGoalDraft(row)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>目标管理</Typography.Title>
          <Typography.Text type="secondary">维护存款、首付、备用金、旅游基金等自定义目标</Typography.Text>
        </div>
        <Button type="primary" onClick={openNewGoal}>
          新增目标
        </Button>
      </div>

      <div className="summary-grid">
        <div className="summary-tile">
          <div className="summary-label">进行中目标</div>
          <div className="summary-value">{overview.activeGoalCount}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">目标总金额</div>
          <div className="summary-value">{formatAmount(overview.totalTargetAmount)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">已完成金额</div>
          <div className="summary-value">{formatAmount(overview.totalCurrentAmount)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">剩余金额</div>
          <div className="summary-value">{formatAmount(overview.totalRemainingAmount)}</div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={4}>目标档案</Typography.Title>
        </div>
        {goalRows.length ? <Table rowKey="id" columns={columns} dataSource={goalRows} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 1180 }} /> : <Empty description="还没有目标，点击右上角新增目标" />}
      </div>

      <GoalModal goal={goalDraft} onChange={setGoalDraft} onCancel={() => setGoalDraft(null)} onSave={saveGoal} />
    </div>
  );
}

interface GoalModalProps {
  goal: Goal | null;
  onChange: (goal: Goal | null) => void;
  onCancel: () => void;
  onSave: () => void;
}

function GoalModal({ goal, onChange, onCancel, onSave }: GoalModalProps) {
  const summary = goal ? calculateGoalSummaries([goal])[0] : undefined;

  return (
    <Modal width={720} title="目标档案" open={Boolean(goal)} onOk={onSave} onCancel={onCancel} okText="保存" cancelText="取消">
      {goal ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input value={goal.name} placeholder="目标名称，例如年存款目标、买房首付" onChange={(event) => onChange({ ...goal, name: event.target.value })} />
          <Space wrap>
            <InputNumber
              min={0}
              precision={2}
              value={goal.targetAmount}
              addonBefore="目标金额"
              addonAfter="元"
              onChange={(value) => onChange({ ...goal, targetAmount: Number(value ?? 0) })}
            />
            <InputNumber
              min={0}
              precision={2}
              value={goal.currentAmount}
              addonBefore="已完成"
              addonAfter="元"
              onChange={(value) => onChange({ ...goal, currentAmount: Number(value ?? 0) })}
            />
          </Space>
          <Space wrap>
            <Input style={{ width: 180 }} value={goal.startDate} addonBefore="开始日期" placeholder="YYYY-MM-DD" onChange={(event) => onChange({ ...goal, startDate: event.target.value })} />
            <Input style={{ width: 180 }} value={goal.targetDate} addonBefore="目标日期" placeholder="YYYY-MM-DD" onChange={(event) => onChange({ ...goal, targetDate: event.target.value })} />
            <Select
              value={goal.status}
              style={{ width: 140 }}
              options={[
                { value: 'active', label: '进行中' },
                { value: 'completed', label: '已完成' },
                { value: 'paused', label: '暂停' },
              ]}
              onChange={(value) => onChange({ ...goal, status: value })}
            />
          </Space>
          <Space wrap>
            <Tag>剩余金额：{formatAmount(summary?.remainingAmount ?? 0)}</Tag>
            <Tag>完成率：{formatPercent(summary?.progressRate ?? 0)}</Tag>
            <Tag>剩余月份：{summary?.remainingMonths ?? 0}</Tag>
            <Tag color="blue">每月需存：{formatAmount(summary?.requiredMonthlySaving ?? 0)}</Tag>
          </Space>
          <Input.TextArea rows={3} value={goal.remark} placeholder="备注" onChange={(event) => onChange({ ...goal, remark: event.target.value })} />
        </Space>
      ) : null}
    </Modal>
  );
}

function getToday(): string {
  const date = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDateAfterMonths(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
