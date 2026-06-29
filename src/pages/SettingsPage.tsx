import { useEffect, useState } from 'react';
import { Alert, Button, InputNumber, Modal, Space, Typography, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UserSettings } from '../types/settings';
import { backupRepository } from '../repositories/backupRepository';
import { settingsRepository } from '../repositories/settingsRepository';

interface SettingsPageProps {
  onDataImported: () => Promise<void>;
}

export default function SettingsPage({ onDataImported }: SettingsPageProps) {
  const [settings, setSettings] = useState<UserSettings>(settingsRepository.createDefaultUserSettings());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    void settingsRepository.getUserSettings().then(setSettings);
  }, []);

  const handleSaveIncome = async () => {
    if (settings.defaultMonthlyIncome < 0) {
      message.warning('默认月收入不能小于 0');
      return;
    }

    await settingsRepository.saveUserSettings(settings);
    message.success('默认月收入已保存');
  };

  const uploadProps: UploadProps = {
    accept: '.json,application/json',
    showUploadList: false,
    beforeUpload: async (file) => {
      try {
        const text = await file.text();
        const backup = backupRepository.validateBackupFile(JSON.parse(text));

        Modal.confirm({
          title: '确认导入本地数据？',
          content: '导入会覆盖当前浏览器里的设置、预算和已保存账单。如果当前数据没有备份，覆盖后无法恢复。',
          okText: '确认导入',
          cancelText: '取消',
          onOk: async () => {
            setImporting(true);
            try {
              await backupRepository.importLocalData(backup);
              await onDataImported();
              setSettings(backup.userSettings);
              message.success('本地数据导入成功');
            } finally {
              setImporting(false);
            }
          },
        });
      } catch (error) {
        message.error(error instanceof Error ? error.message : '导入失败，请检查文件');
      }

      return false;
    },
  };

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>设置</Typography.Title>
          <Typography.Text type="secondary">管理默认收入和本地数据备份</Typography.Text>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>默认月收入</Typography.Title>
            <Typography.Text type="secondary">月度分析会使用这个收入计算结余和占收入比例</Typography.Text>
          </div>
        </div>
        <Space align="center">
          <InputNumber
            min={0}
            precision={2}
            value={settings.defaultMonthlyIncome}
            addonAfter="元"
            style={{ width: 220 }}
            onChange={(value) => setSettings({ ...settings, defaultMonthlyIncome: Number(value ?? 0) })}
          />
          <Button type="primary" onClick={handleSaveIncome}>
            保存
          </Button>
          <Typography.Text type="secondary">最后保存：{settings.updatedAt ? new Date(settings.updatedAt).toLocaleString() : '未保存'}</Typography.Text>
        </Space>
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>本地数据备份</Typography.Title>
            <Typography.Text type="secondary">导出文件后，可以在另一台电脑导入恢复账单、预算、资产、目标和设置数据</Typography.Text>
          </div>
        </div>
        <Alert
          showIcon
          type="info"
          message="本地数据只保存在当前浏览器中。换电脑前请先导出备份文件，再到新电脑导入。"
          style={{ marginBottom: 16 }}
        />
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => void backupRepository.exportLocalData().then(() => message.success('导出完成'))}>
            导出本地数据
          </Button>
          <Upload {...uploadProps}>
            <Button loading={importing} icon={<UploadOutlined />}>
              导入本地数据
            </Button>
          </Upload>
        </Space>
      </div>
    </div>
  );
}
